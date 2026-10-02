from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.accounts import router as accounts_router
from app.routers.deals import router as deals_router
from app.routers.stakeholders import router as stakeholders_router
from app.routers.interactions import router as interactions_router
from app.routers.follow_ups import router as follow_ups_router
from app.routers.memory import router as memory_router

app = FastAPI(
    title=settings.app_name,
    description="AI Sales Intelligence Agent — Real Backend API Foundation",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(accounts_router, prefix="/api")
app.include_router(deals_router, prefix="/api")
app.include_router(stakeholders_router, prefix="/api")
app.include_router(interactions_router, prefix="/api")
app.include_router(follow_ups_router, prefix="/api")
app.include_router(memory_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.app_name,
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/health",
    }
