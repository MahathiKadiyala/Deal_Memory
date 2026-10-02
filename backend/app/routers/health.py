from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(prefix="", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Tests actual backend service health and database connectivity.",
)
def check_health(db: Session = Depends(get_db)):
    try:
        # Actually execute a test query on PostgreSQL
        db.execute(text("SELECT 1"))
        return HealthResponse(
            status="ok",
            service=settings.app_name,
            database="connected",
        )
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "service": settings.app_name,
                "database": "disconnected",
                "error": str(exc),
            },
        )
