from sqlalchemy import select

from app.db import Client, Database, get_db_instance


class ClientService:
    def __init__(self, db: Database | None = None) -> None:
        self.db = db or get_db_instance()

    def list_clients(self):
        session = self.db.get_session()
        try:
            clients = session.scalars(select(Client).order_by(Client.id)).all()
            return {
                "message": "Clients fetched successfully",
                "data": [client.to_summary() for client in clients],
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
