from typing import Any

from sqlalchemy import Float, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base


class Market(Base):
    __tablename__ = "markets"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    towns: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    setting: Mapped[str | None] = mapped_column(String, nullable=True)
    typical_traveler: Mapped[str | None] = mapped_column(Text, nullable=True)
    annual_appreciation: Mapped[float | None] = mapped_column(Float, nullable=True)
    land_value_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
