from fastapi import APIRouter

from app.routes import clients, feedback, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(clients.router)
api_router.include_router(feedback.router)
