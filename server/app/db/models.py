from datetime import date
from typing import Any

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


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

    def to_summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "budget": float(self.budget) if self.budget is not None else None,
            "budget_flexibility": self.budget_flexibility,
            "main_focus": self.main_focus,
            "market_preferences": self.market_preferences,
            "min_bedrooms": self.min_bedrooms,
            "onboarded_at": self.onboarded_at.isoformat() if self.onboarded_at else None,
        }

    def to_profile(self) -> dict[str, Any]:
        return {
            **self.to_summary(),
            "budget_range": self.budget_range,
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


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    purchase_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    baths: Mapped[float | None] = mapped_column(Float, nullable=True)
    lot_acres: Mapped[float | None] = mapped_column(Float, nullable=True)
    turnkey: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    interest_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    closing_cost_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    setup_items: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    annual_opex: Mapped[float | None] = mapped_column(Float, nullable=True)
    revenue: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    est_year1_tax_savings: Mapped[float | None] = mapped_column(Float, nullable=True)
    comps: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    highlights: Mapped[list[Any] | None] = mapped_column(JSONB, nullable=True)
    analyst_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    def to_summary(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "purchase_price": float(self.purchase_price)
            if self.purchase_price is not None
            else None,
            "bedrooms": self.bedrooms,
            "baths": float(self.baths) if self.baths is not None else None,
            "lot_acres": float(self.lot_acres) if self.lot_acres is not None else None,
            "turnkey": self.turnkey,
            "revenue": self.revenue,
            "highlights": self.highlights,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
        }

    def to_dict(self) -> dict[str, Any]:
        return {
            **self.to_summary(),
            "interest_rate": float(self.interest_rate)
            if self.interest_rate is not None
            else None,
            "closing_cost_pct": float(self.closing_cost_pct)
            if self.closing_cost_pct is not None
            else None,
            "setup_items": self.setup_items,
            "annual_opex": float(self.annual_opex)
            if self.annual_opex is not None
            else None,
            "est_year1_tax_savings": float(self.est_year1_tax_savings)
            if self.est_year1_tax_savings is not None
            else None,
            "comps": self.comps,
            "analyst_notes": self.analyst_notes,
        }


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
