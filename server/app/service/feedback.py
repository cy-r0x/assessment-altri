"""Persist a client's thumbs up or down on a deal.

One row per (client_id, deal_id):
- same reaction again → undo (delete)
- different reaction → overwrite
- none yet → create
"""

from __future__ import annotations

from datetime import date

from sqlalchemy import select

from app.core import AppError
from app.db import Client, Database, Deal, Feedback, get_db_instance


class FeedbackService:
    def __init__(self, db: Database | None = None) -> None:
        self._db = db

    @property
    def db(self) -> Database:
        if self._db is None:
            self._db = get_db_instance()
        return self._db

    def create_feedback(self, payload: dict):
        client_id = str(payload.get("client_id") or "").strip()
        deal_id = str(payload.get("deal_id") or "").strip()
        reaction = str(payload.get("reaction") or "").strip().lower()
        comment = payload.get("comment")
        if isinstance(comment, str):
            comment = comment.strip() or None
        elif comment is not None:
            comment = str(comment).strip() or None

        if not client_id or not deal_id:
            raise AppError("client_id and deal_id are required", status_code=422)
        if reaction not in {"up", "down"}:
            raise AppError("Reaction must be up or down", status_code=422)

        session = self.db.get_session()
        try:
            if session.get(Client, client_id) is None:
                raise AppError("Client not found", status_code=404)
            if session.get(Deal, deal_id) is None:
                raise AppError("Deal not found", status_code=404)

            existing = list(
                session.scalars(
                    select(Feedback)
                    .where(Feedback.client_id == client_id, Feedback.deal_id == deal_id)
                    .order_by(Feedback.created_at.desc(), Feedback.id.desc())
                ).all()
            )

            if existing:
                latest = existing[0]
                # Same reaction → undo every row for this pair.
                if latest.reaction == reaction:
                    for row in existing:
                        session.delete(row)
                    session.commit()
                    return {"action": "undone", "client_id": client_id, "deal_id": deal_id}

                # Different reaction → keep one row, overwrite, drop duplicates.
                keep = latest
                for row in existing[1:]:
                    session.delete(row)
                keep.reaction = reaction
                if comment is not None:
                    keep.comment = comment
                keep.created_at = date.today()
                session.commit()
                session.refresh(keep)
                return {**keep.to_dict(), "action": "updated"}

            row = Feedback(
                client_id=client_id,
                deal_id=deal_id,
                reaction=reaction,
                comment=comment,
                created_at=date.today(),
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return {**row.to_dict(), "action": "created"}
        except AppError:
            session.rollback()
            raise
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


feedback_service = FeedbackService()
