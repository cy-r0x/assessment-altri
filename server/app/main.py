from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="assessment-altri API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FeedbackCreate(BaseModel):
    client_id: str
    deal_id: str
    reaction: str = Field(pattern="^(up|down)$")
    comment: str | None = None


@app.get("/")
def root():
    return {"message": "assessment-altri API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/clients")
def list_clients():
    """List clients with a short summary each."""
    return {"clients": []}


@app.get("/clients/{client_id}")
def get_client(client_id: str):
    """Client profile and feedback history."""
    return {
        "id": client_id,
        "profile": None,
        "feedback": [],
    }


@app.get("/clients/{client_id}/recommendations")
def get_recommendations(client_id: str):
    """Ranked deals + excluded deals with the rule each broke."""
    return {
        "client_id": client_id,
        "recommendations": [],
        "excluded": [],
    }


@app.post("/feedback")
def create_feedback(payload: FeedbackCreate):
    """Record a thumbs up/down with an optional comment."""
    return {
        "ok": True,
        "feedback": payload.model_dump(),
    }
