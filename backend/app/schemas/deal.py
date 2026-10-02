import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DealBase(BaseModel):
    account_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255, description="Deal title / name")
    value: Decimal = Field(default=Decimal("0.00"), ge=0, description="Estimated deal value")
    stage: str = Field(default="Discovery", max_length=50, description="Sales pipeline stage")
    health: str = Field(default="Healthy", max_length=50, description="Deal health rating")
    main_objection: Optional[str] = Field(None, max_length=255)
    next_action: Optional[str] = Field(None, max_length=255)
    last_interaction_at: Optional[datetime] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    account_id: Optional[uuid.UUID] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    value: Optional[Decimal] = Field(None, ge=0)
    stage: Optional[str] = Field(None, max_length=50)
    health: Optional[str] = Field(None, max_length=50)
    main_objection: Optional[str] = Field(None, max_length=255)
    next_action: Optional[str] = Field(None, max_length=255)
    last_interaction_at: Optional[datetime] = None


class DealResponse(DealBase):
    id: uuid.UUID
    owner_user_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
