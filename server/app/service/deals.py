from __future__ import annotations

from math import ceil

from app.core import AppError
from app.db import Database, Deal, get_db_instance
from app.db.models.types import DealDetail
from app.service.types import DealListResult


class DealService:
    def __init__(self, db: Database | None = None) -> None:
        self.db = db or get_db_instance()

    def list_deals(self, page: int = 1, limit: int = 10) -> DealListResult:
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        session = self.db.get_session()
        try:
            total = Deal.count(session)
            deals = Deal.get_many(
                session,
                order_by=Deal.id,
                offset=offset,
                limit=limit,
            )

            return {
                "items": [deal.to_summary() for deal in deals],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": ceil(total / limit) if limit else 0,
                },
            }
        finally:
            session.close()

    def get_deal(self, deal_id: str) -> DealDetail:
        session = self.db.get_session()
        try:
            deal = Deal.get_by_id(session, deal_id)
            if deal is None:
                raise AppError("Deal not found", status_code=404)
            return deal.to_dict()
        finally:
            session.close()


deal_service = DealService()
