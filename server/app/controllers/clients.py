from fastapi import APIRouter

from app.service import clients as clients_service

router = APIRouter(tags=["clients"])


@router.get("/clients")
def list_clients():
    """List clients with a short summary each."""
    return clients_service.list_clients()


@router.get("/clients/{client_id}")
def get_client(client_id: str):
    """Client profile and feedback history."""
    return clients_service.get_client(client_id)


@router.get("/clients/{client_id}/recommendations")
def get_recommendations(client_id: str):
    """Ranked deals + excluded deals with the rule each broke."""
    return clients_service.get_recommendations(client_id)
