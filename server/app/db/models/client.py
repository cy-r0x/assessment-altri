from datetime import date
from typing import Any

from sqlalchemy import Boolean, Date, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base
from app.db.models.types import ClientProfile, ClientSummary


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    budget_range: Mapped[str | None] = mapped_column(String, nullable=True)
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    budget_flexibility: Mapped[str | None] = mapped_column(String, nullable=True)
    down_payment_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    cohost_fee_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    main_focus: Mapped[str | None] = mapped_column(String, nullable=True)
    market_preferences: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    avoid_markets: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    setting_rank: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    renovation_appetite: Mapped[str | None] = mapped_column(String, nullable=True)
    wow_factors: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    wants_turnkey: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    min_bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarded_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    def to_summary(self) -> ClientSummary:
        return {
            "id": self.id,
            "name": self.name,
            "budget": float(self.budget) if self.budget is not None else None,
            "budget_range": self.budget_range,
            "budget_flexibility": self.budget_flexibility,
            "main_focus": self.main_focus,
            "market_preferences": self.market_preferences,
            "min_bedrooms": self.min_bedrooms,
            "onboarded_at": self.onboarded_at.isoformat() if self.onboarded_at else None,
        }

    def to_profile(self) -> ClientProfile:
        return {
            **self.to_summary(),
            "down_payment_pct": float(self.down_payment_pct)
            if self.down_payment_pct is not None
            else None,
            "cohost_fee_pct": float(self.cohost_fee_pct)
            if self.cohost_fee_pct is not None
            else None,
            "avoid_markets": self.avoid_markets,
            "setting_rank": self.setting_rank,
            "renovation_appetite": self.renovation_appetite,
            "wow_factors": self.wow_factors,
            "wants_turnkey": self.wants_turnkey,
            "notes": self.notes,
        }
