"""Typed dict shapes returned by ORM `to_*` helpers."""

from __future__ import annotations

from typing import Any, TypedDict


class ClientSummary(TypedDict):
    id: str
    name: str | None
    budget: float | None
    budget_range: str | None
    budget_flexibility: str | None
    main_focus: str | None
    market_preferences: list[Any] | None
    min_bedrooms: int | None
    onboarded_at: str | None


class ClientProfile(ClientSummary):
    down_payment_pct: float | None
    cohost_fee_pct: float | None
    avoid_markets: list[Any] | None
    setting_rank: dict[str, Any] | None
    renovation_appetite: str | None
    wow_factors: list[Any] | None
    wants_turnkey: bool | None
    notes: str | None


class DealSummary(TypedDict):
    id: str
    address: str | None
    city: str | None
    state: str | None
    purchase_price: float | None
    bedrooms: int | None
    baths: float | None
    lot_acres: float | None
    turnkey: bool | None
    revenue: dict[str, Any] | None
    highlights: list[Any] | None
    approved_at: str | None


class DealDetail(DealSummary):
    interest_rate: float | None
    closing_cost_pct: float | None
    setup_items: list[Any] | None
    annual_opex: float | None
    est_year1_tax_savings: float | None
    comps: list[Any] | None
    analyst_notes: str | None


class FeedbackDict(TypedDict):
    id: int
    client_id: str
    deal_id: str
    reaction: str
    comment: str | None
    created_at: str | None
