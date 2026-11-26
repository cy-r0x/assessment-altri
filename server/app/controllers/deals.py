from fastapi import APIRouter, Query

from app.core import success
from app.service.deals import deal_service

router = APIRouter(tags=["deals"])


@router.get("/deals")
def list_deals(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """List deals with pagination."""
    result = deal_service.list_deals(page=page, limit=limit)
    return success(
        "Deals fetched successfully",
        result["data"],
        pagination=result["pagination"],
    )


@router.get("/deals/{deal_id}")
def get_deal(deal_id: str):
    """Full deal details."""
    return success(
        "Deal fetched successfully",
        deal_service.get_deal(deal_id),
    )
