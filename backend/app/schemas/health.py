from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    error: Optional[str] = None
