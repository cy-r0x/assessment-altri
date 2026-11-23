from math import ceil

from sqlalchemy import func, select

from app.db import Database, Deal, get_db_instance


class DealService:
    def __init__(self, db: Database | None = None) -> None:
        self.db = db or get_db_instance()

    def list_deals(self, page: int = 1, limit: int = 10):
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        session = self.db.get_session()
        try:
            total = session.scalar(select(func.count()).select_from(Deal)) or 0
            deals = session.scalars(
                select(Deal).order_by(Deal.id).offset(offset).limit(limit)
            ).all()

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


deal_service = DealService()
