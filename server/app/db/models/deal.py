from datetime import date
from typing import Any

from sqlalchemy import Boolean, Date, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base


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
