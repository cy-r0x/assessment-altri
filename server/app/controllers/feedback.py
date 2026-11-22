from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core import success
from app.service import feedback as feedback_service

router = APIRouter(tags=["feedback"])


class FeedbackCreate(BaseModel):
    client_id: str
    deal_id: str
    reaction: str = Field(pattern="^(up|down)$")
    comment: str | None = None


@router.post("/feedback")
def create_feedback(payload: FeedbackCreate):
    """Record a thumbs up/down with an optional comment."""
    return success(
        "Feedback recorded successfully",
        feedback_service.create_feedback(payload.model_dump()),
    )
