import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class StakeholderBase(BaseModel):
    account_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255, description="Stakeholder full name")
    role: Optional[str] = Field(None, max_length=255, description="Role / title at company")
    email: Optional[str] = Field(None, max_length=255, description="Email address")


class StakeholderCreate(StakeholderBase):
    pass


class StakeholderUpdate(BaseModel):
    account_id: Optional[uuid.UUID] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, max_length=255)


class StakeholderResponse(StakeholderBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
