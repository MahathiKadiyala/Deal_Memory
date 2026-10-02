import uuid
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, ConfigDict, Field


class MemoryRetainRequest(BaseModel):
    deal_id: uuid.UUID = Field(..., description="ID of the deal to retain experiential memory for")
    content: str = Field(..., min_length=1, description="Concise, durable sales experience content")
    context: Optional[str] = Field(None, description="Optional situational context (e.g. stage, objection)")
    document_id: Optional[str] = Field(None, description="Optional tracking identifier (e.g. interaction UUID)")
    metadata: Optional[Dict[str, str]] = Field(None, description="Optional key-value metadata tags")


class MemoryRetainResponse(BaseModel):
    success: bool
    deal_id: uuid.UUID
    bank_id: str
    memory_sync_status: str = Field(..., description="'retained' or 'failed'")
    message: str
    error: Optional[str] = None


class MemoryRecallRequest(BaseModel):
    deal_id: uuid.UUID = Field(..., description="ID of the deal to recall experiential memory from")
    query: str = Field(
        ...,
        min_length=1,
        description="Contextual sales question (e.g. 'What pricing approaches worked previously for this deal?')",
    )
    max_tokens: Optional[int] = Field(default=4096, ge=100, le=16384)
    budget: Optional[str] = Field(default="mid", description="Recall budget: 'low', 'mid', or 'high'")


class RecalledMemoryItem(BaseModel):
    id: Optional[str] = None
    text: str
    context: Optional[str] = None
    occurred_start: Optional[str] = None
    occurred_end: Optional[str] = None
    score: Optional[float] = None


class MemoryRecallResponse(BaseModel):
    deal_id: uuid.UUID
    bank_id: str
    query: str
    memories: List[RecalledMemoryItem]
    prompt_context: Optional[str] = None
    count: int


class StakeholderSummary(BaseModel):
    name: str
    role: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InteractionSummary(BaseModel):
    id: uuid.UUID
    interaction_type: str
    interaction_date: datetime
    concern: Optional[str] = None
    approach: Optional[str] = None
    outcome: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DealPreparationResponse(BaseModel):
    deal_id: uuid.UUID
    deal_name: str
    account_name: str
    current_stage: str
    deal_health: str
    main_objection: Optional[str] = None
    next_action: Optional[str] = None
    stakeholders: List[StakeholderSummary]
    recent_interactions: List[InteractionSummary]
    recall_query: str
    recalled_memories: List[RecalledMemoryItem]
    prompt_context: Optional[str] = None
    hindsight_status: str = Field(
        ..., description="Hindsight execution status: 'recalled', 'not_configured', or 'failed'"
    )
