from fastapi import APIRouter

router = APIRouter(tags=["clients"])


@router.get("/clients")
def list_clients():
    """List clients with a short summary each."""
    return {"clients": []}


@router.get("/clients/{client_id}")
def get_client(client_id: str):
    """Client profile and feedback history."""
    return {
        "id": client_id,
        "profile": None,
        "feedback": [],
    }


@router.get("/clients/{client_id}/recommendations")
def get_recommendations(client_id: str):
    """Ranked deals + excluded deals with the rule each broke."""
    return {
        "client_id": client_id,
        "recommendations": [],
        "excluded": [],
    }
