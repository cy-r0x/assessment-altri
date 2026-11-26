from datetime import date
from typing import Any

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[str] = mapped_column(String, ForeignKey("clients.id"), nullable=False)
    deal_id: Mapped[str] = mapped_column(String, nullable=False)
    reaction: Mapped[str] = mapped_column(String, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "client_id": self.client_id,
            "deal_id": self.deal_id,
            "reaction": self.reaction,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
