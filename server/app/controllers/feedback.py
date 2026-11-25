from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core import success
from app.service.feedback import feedback_service

router = APIRouter(tags=["feedback"])


class FeedbackCreate(BaseModel):
    client_id: str
    deal_id: str
    reaction: str = Field(pattern="^(up|down)$")
    comment: str | None = None


@router.post("/feedback")
def create_feedback(payload: FeedbackCreate):
    """Upsert thumbs: create, overwrite, or undo if the same reaction is posted again."""
    result = feedback_service.create_feedback(payload.model_dump())
    action = result.get("action")
    if action == "undone":
        return success("Feedback removed successfully", result)
    if action == "updated":
        return success("Feedback updated successfully", result)
    return success("Feedback recorded successfully", result)
