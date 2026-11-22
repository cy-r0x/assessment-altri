from fastapi import APIRouter

from app.core import success

router = APIRouter(tags=["health"])


@router.get("/")
def root():
    return success("assessment-altri API is running")


@router.get("/health")
def health():
    return success("OK", {"status": "ok"})
