from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.accounts import router as accounts_router
from app.routers.deals import router as deals_router
from app.routers.stakeholders import router as stakeholders_router
from app.routers.interactions import router as interactions_router
from app.routers.follow_ups import router as follow_ups_router
from app.routers.memory import router as memory_router

__all__ = [
    "health_router",
    "auth_router",
    "accounts_router",
    "deals_router",
    "stakeholders_router",
    "interactions_router",
    "follow_ups_router",
    "memory_router",
]
