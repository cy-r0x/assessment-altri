"""Typed return shapes for service-layer methods."""

from __future__ import annotations

from typing import Literal, NotRequired, TypedDict

from app.db.models.types import (
    ClientProfile,
    ClientSummary,
    DealDetail,
    DealSummary,
    FeedbackDict,
)


class Pagination(TypedDict):
    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResult[T](TypedDict):
    """Default paginated service response: always `data` + `pagination`."""

    data: T
    pagination: Pagination


class Range3(TypedDict):
    low: float
    mid: float
    high: float


class CocRange3(TypedDict):
    low: float | None
    mid: float | None
    high: float | None


class DealMetrics(TypedDict):
    cash_needed: float
    loan_amount: float
    debt_service: float
    cash_flow: Range3
    coc: CocRange3


class RecommendationMetrics(TypedDict):
    cash_needed: float
    debt_service: float
    cash_flow: Range3
    coc: CocRange3


class ClientListResult(PaginatedResult[list[ClientSummary]]):
    """GET /clients"""


class FeedbackWithDeal(FeedbackDict):
    deal_address: str | None
    deal_city: str | None
    deal_state: str | None


class ClientDetailResult(TypedDict):
    profile: ClientProfile
    feedback: list[FeedbackWithDeal]


class RecommendationMarket(TypedDict):
    id: str | None
    name: str | None
    setting: str | None
    annual_appreciation: float | None


class RecommendationItem(TypedDict):
    deal: DealSummary
    market: RecommendationMarket
    metrics: RecommendationMetrics
    explanation: str


class ExcludedDealMetrics(TypedDict, total=False):
    cash_needed: float
    budget_cap: float
    coc_low: float | None
    cash_flow_low: float


class ExcludedDeal(TypedDict):
    deal_id: str
    rule: str
    deal_address: str | None
    deal_city: str | None
    deal_state: str | None
    metrics: NotRequired[ExcludedDealMetrics]


class RecommendationsData(TypedDict):
    client_id: str
    main_focus: str | None
    recommendations: list[RecommendationItem]
    excluded: list[ExcludedDeal]


class RecommendationsResult(PaginatedResult[RecommendationsData]):
    """GET /clients/{id}/recommendations"""


class DealListResult(PaginatedResult[list[DealSummary]]):
    """GET /deals"""


class FeedbackCreated(FeedbackDict):
    action: Literal["created"]


class FeedbackUpdated(FeedbackDict):
    action: Literal["updated"]


class FeedbackUndone(TypedDict):
    action: Literal["undone"]
    client_id: str
    deal_id: str


FeedbackMutationResult = FeedbackCreated | FeedbackUpdated | FeedbackUndone

__all__ = [
    "ClientDetailResult",
    "ClientListResult",
    "ClientProfile",
    "ClientSummary",
    "CocRange3",
    "DealDetail",
    "DealListResult",
    "DealMetrics",
    "DealSummary",
    "ExcludedDeal",
    "ExcludedDealMetrics",
    "FeedbackCreated",
    "FeedbackDict",
    "FeedbackMutationResult",
    "FeedbackUndone",
    "FeedbackUpdated",
    "FeedbackWithDeal",
    "PaginatedResult",
    "Pagination",
    "Range3",
    "RecommendationItem",
    "RecommendationMarket",
    "RecommendationMetrics",
    "RecommendationsData",
    "RecommendationsResult",
]
