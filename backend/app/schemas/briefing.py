import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DealBriefingContent(BaseModel):
    key_points: List[str] = Field(
        default_factory=list,
        description="Core strategic takeaways and contextual dynamics for this deal",
    )
    what_worked: List[str] = Field(
        default_factory=list,
        description="Proven tactics, messaging, or framing that yielded positive engagement in past interactions",
    )
    what_failed: List[str] = Field(
        default_factory=list,
        description="Tactics, discounting strategies, or approaches that stalled or failed according to recorded evidence",
    )
    stakeholders: List[str] = Field(
        default_factory=list,
        description="Stakeholder priorities, key concerns, and engagement guidance from evidence",
    )
    pending_commitments: List[str] = Field(
        default_factory=list,
        description="Active commitments, promises, or pending deliverables identified in interactions",
    )
    recommended_approach: str = Field(
        ...,
        description="Grounded, evidence-based strategic recommendation for the sales representative's next interaction",
    )
    evidence: List[str] = Field(
        default_factory=list,
        description="Direct factual citations and references to interaction history and Hindsight experiential memories",
    )

    model_config = ConfigDict(extra="ignore")


class DealBriefingResponse(BaseModel):
    deal_id: uuid.UUID = Field(..., description="ID of the deal briefed")
    deal_name: str = Field(..., description="Name of the deal")
    account_name: str = Field(..., description="Name of the client account")
    hindsight_status: str = Field(
        ..., description="Hindsight memory status: 'recalled', 'failed', or 'not_configured'"
    )
    recalled_memories_count: int = Field(
        ..., description="Number of experiential memories retrieved from Hindsight"
    )
    model: str = Field(..., description="Groq model utilized for reasoning and briefing synthesis")
    briefing: DealBriefingContent = Field(..., description="Grounded AI executive sales briefing")
    error: Optional[str] = Field(
        None, description="Non-sensitive error or caveat message if memory or generation had constraints"
    )

    model_config = ConfigDict(from_attributes=True)
