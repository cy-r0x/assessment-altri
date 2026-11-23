from fastapi import APIRouter

from app.controllers import clients, deals, feedback, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(clients.router)
api_router.include_router(deals.router)
api_router.include_router(feedback.router)
