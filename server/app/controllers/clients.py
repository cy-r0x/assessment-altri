from fastapi import APIRouter, Query

from app.core import success
from app.service.clients import client_service

router = APIRouter(tags=["clients"])


@router.get("/clients")
def list_clients(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """List clients with a short summary each."""
    result = client_service.list_clients(page=page, limit=limit)
    return success(
        "Clients fetched successfully",
        result["items"],
        pagination=result["pagination"],
    )


@router.get("/clients/{client_id}")
def get_client(client_id: str):
    """Client profile and feedback history."""
    return success(
        "Client fetched successfully",
        client_service.get_client(client_id),
    )


@router.get("/clients/{client_id}/recommendations")
def get_recommendations(
    client_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1, le=100),
):
    """Ranked deals + excluded deals with the rule each broke."""
    result = client_service.get_recommendations(client_id, page=page, limit=limit)
    return success(
        "Recommendations fetched successfully",
        result["data"],
        pagination=result["pagination"],
    )
