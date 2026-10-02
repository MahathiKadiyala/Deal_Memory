import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class FollowUpBase(BaseModel):
    deal_id: Optional[uuid.UUID] = None
    account_id: Optional[uuid.UUID] = None
    stakeholder_id: Optional[uuid.UUID] = None
    title: str = Field(..., min_length=1, max_length=255, description="Follow-up action item / task title")
    due_at: Optional[datetime] = Field(None, description="Due date and time for the follow-up task")
    priority: str = Field(default="Medium", max_length=50, description="Priority level (Low, Medium, High, Urgent)")
    status: str = Field(default="Pending", max_length=50, description="Status (Pending, Completed, Cancelled)")
    notes: Optional[str] = Field(None, description="Additional context or checklist items")


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpUpdate(BaseModel):
    deal_id: Optional[uuid.UUID] = None
    account_id: Optional[uuid.UUID] = None
    stakeholder_id: Optional[uuid.UUID] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    due_at: Optional[datetime] = None
    priority: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class FollowUpResponse(BaseModel):
    id: uuid.UUID
    deal_id: Optional[uuid.UUID] = None
    account_id: uuid.UUID
    stakeholder_id: Optional[uuid.UUID] = None
    title: str
    due_at: Optional[datetime] = None
    priority: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
