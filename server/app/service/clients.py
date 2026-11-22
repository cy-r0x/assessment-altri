from math import ceil

from sqlalchemy import func, select

from app.db import Client, Database, get_db_instance


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
                "message": "Clients fetched successfully",
                "data": [client.to_summary() for client in clients],
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
        return {
            "id": client_id,
            "profile": None,
            "feedback": [],
        }

    def get_recommendations(self, client_id: str):
        return {
            "client_id": client_id,
            "recommendations": [],
            "excluded": [],
        }


client_service = ClientService()
