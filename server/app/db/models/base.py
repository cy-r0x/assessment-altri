from __future__ import annotations

from collections.abc import Sequence
from typing import Any, Self

from sqlalchemy import ColumnElement, Select, func, select
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    """Shared Active-Record-style query helpers for every mapped model."""

    @classmethod
    def query(cls, *where: ColumnElement[bool]) -> Select[tuple[Self]]:
        stmt = select(cls)
        if where:
            stmt = stmt.where(*where)
        return stmt

    @classmethod
    def get_many(
        cls,
        session: Session,
        *where: ColumnElement[bool],
        order_by: Any | Sequence[Any] | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> list[Self]:
        """Fetch rows matching optional WHERE clauses."""
        stmt = cls.query(*where)
        if order_by is not None:
            if isinstance(order_by, (list, tuple)):
                stmt = stmt.order_by(*order_by)
            else:
                stmt = stmt.order_by(order_by)
        if offset is not None:
            stmt = stmt.offset(offset)
        if limit is not None:
            stmt = stmt.limit(limit)
        return list(session.scalars(stmt).all())

    @classmethod
    def get_one(
        cls,
        session: Session,
        *where: ColumnElement[bool],
        order_by: Any | Sequence[Any] | None = None,
    ) -> Self | None:
        """Fetch the first matching row, or None."""
        rows = cls.get_many(session, *where, order_by=order_by, limit=1)
        return rows[0] if rows else None

    @classmethod
    def get_by_id(cls, session: Session, id: Any) -> Self | None:
        return session.get(cls, id)

    @classmethod
    def count(cls, session: Session, *where: ColumnElement[bool]) -> int:
        stmt = select(func.count()).select_from(cls)
        if where:
            stmt = stmt.where(*where)
        return int(session.scalar(stmt) or 0)
