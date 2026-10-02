import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class InteractionBase(BaseModel):
    deal_id: Optional[uuid.UUID] = None
    account_id: Optional[uuid.UUID] = None
    stakeholder_id: Optional[uuid.UUID] = None
    interaction_type: str = Field(
        ..., min_length=1, max_length=50, description="Type of interaction (e.g. Call, Meeting, Email, Demo)"
    )
    interaction_date: Optional[datetime] = Field(
        None, description="Timestamp of the interaction; defaults to now if omitted"
    )
    concern: Optional[str] = Field(None, description="Key prospect concern or objection identified")
    approach: Optional[str] = Field(None, description="Strategy or response taken by sales rep")
    outcome: str = Field(
        default="Neutral", max_length=50, description="Outcome (e.g. Positive, Neutral, Negative, Blocked)"
    )
    notes: Optional[str] = Field(None, description="Detailed notes on the interaction")


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(BaseModel):
    deal_id: Optional[uuid.UUID] = None
    account_id: Optional[uuid.UUID] = None
    stakeholder_id: Optional[uuid.UUID] = None
    interaction_type: Optional[str] = Field(None, min_length=1, max_length=50)
    interaction_date: Optional[datetime] = None
    concern: Optional[str] = None
    approach: Optional[str] = None
    outcome: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None


class InteractionResponse(BaseModel):
    id: uuid.UUID
    deal_id: Optional[uuid.UUID] = None
    account_id: uuid.UUID
    stakeholder_id: Optional[uuid.UUID] = None
    interaction_type: str
    interaction_date: datetime
    concern: Optional[str] = None
    approach: Optional[str] = None
    outcome: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Experiential Memory Synchronization Status
    memory_sync_status: Optional[str] = Field(
        None, description="Hindsight memory sync status: 'retained', 'failed', or 'skipped'"
    )
    memory_error: Optional[str] = Field(
        None, description="Non-sensitive error message if Hindsight memory sync failed"
    )

    model_config = ConfigDict(from_attributes=True)
