from math import ceil

from sqlalchemy import func, select

from app.core import AppError
from app.db import Client, Database, Deal, Feedback, get_db_instance


class ClientService:
    def __init__(self, db: Database | None = None) -> None:
        self.db = db or get_db_instance()

    def list_clients(self, page: int = 1, limit: int = 10):
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        session = self.db.get_session()
        try:
            total = session.scalar(select(func.count()).select_from(Client)) or 0
            clients = session.scalars(
                select(Client).order_by(Client.id).offset(offset).limit(limit)
            ).all()

            return {
                "items": [client.to_summary() for client in clients],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": ceil(total / limit) if limit else 0,
                },
            }
        finally:
            session.close()

    def get_client(self, client_id: str):
        session = self.db.get_session()
        try:
            client = session.get(Client, client_id)
            if client is None:
                raise AppError("Client not found", status_code=404)

            feedback = session.scalars(
                select(Feedback)
                .where(Feedback.client_id == client_id)
                .order_by(Feedback.created_at.desc(), Feedback.id.desc())
            ).all()

            return {
                "profile": client.to_profile(),
                "feedback": [item.to_dict() for item in feedback],
            }
        finally:
            session.close()

    def get_recommendations(self, client_id: str):

        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        offset = (page - 1) * limit

        session = self.db.get_session()
        try:
            total = session.scalar(select(func.count()).select_from(Deal)) or 0
            # client_details = session.scalar(select(Client).where(Client.id == client_id))
            # if client_details is None:
            #     raise AppError("Client not found", status_code=404)

            # deals = session.scalars(
            #     select(Deal).order_by(Deal.id).offset(offset).limit(limit)
            # ).all()

            # recommendations = []

            # for deal in deals:
            #     cost = deal.purchase_price * client_details.down_payment_pct
            #     cost += deal.purchase_price * client_details.closing_cost_pct
            #     cost += 
            #     if cost > client_details.budget:
            #         continue
                


        finally:
            session.close()

        return {
            "client_id": client_id,
            "recommendations": [],
            "excluded": [],
        }


client_service = ClientService()
