def list_clients():
    return {"clients": []}


def get_client(client_id: str):
    return {
        "id": client_id,
        "profile": None,
        "feedback": [],
    }


def get_recommendations(client_id: str):
    return {
        "client_id": client_id,
        "recommendations": [],
        "excluded": [],
    }
