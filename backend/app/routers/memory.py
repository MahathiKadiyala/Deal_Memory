import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.deal import Deal
from app.models.interaction import Interaction
from app.models.stakeholder import Stakeholder
from app.models.user import User
from app.schemas.memory import (
    MemoryRetainRequest,
    MemoryRetainResponse,
    MemoryRecallRequest,
    RecalledMemoryItem,
    MemoryRecallResponse,
    DealPreparationResponse,
    StakeholderSummary,
    InteractionSummary,
)
from app.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/memory", tags=["Memory"])


@router.post(
    "/retain",
    response_model=MemoryRetainResponse,
    summary="Retain Experiential Memory",
    description="Manually retains experiential memory into a deal's isolated Hindsight bank. Verifies deal ownership server-side.",
)
async def retain_memory(
    payload: MemoryRetainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify deal ownership
    deal = db.execute(
        select(Deal).where(
            Deal.id == payload.deal_id,
            Deal.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # 2. Derive bank ID strictly server-side
    bank_id = hindsight_service.get_bank_id_for_deal(user_id=current_user.id, deal_id=deal.id)

    # 3. Call Hindsight retain
    success, sync_status, err = await hindsight_service.retain(
        user_id=current_user.id,
        deal_id=deal.id,
        content=payload.content,
        context=payload.context or f"Deal: {deal.name}, Stage: {deal.stage}",
        document_id=payload.document_id,
        metadata=payload.metadata,
    )

    message = "Memory retained successfully" if success else (err or "Memory retention failed")
    return MemoryRetainResponse(
        success=success,
        deal_id=deal.id,
        bank_id=bank_id,
        memory_sync_status=sync_status,
        message=message,
        error=err if not success else None,
    )


@router.post(
    "/recall",
    response_model=MemoryRecallResponse,
    summary="Recall Experiential Memory",
    description="Recalls relevant experiential memory from a deal's isolated Hindsight bank. Verifies deal ownership server-side.",
)
async def recall_memory(
    payload: MemoryRecallRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify deal ownership
    deal = db.execute(
        select(Deal).where(
            Deal.id == payload.deal_id,
            Deal.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # 2. Derive bank ID strictly server-side
    bank_id = hindsight_service.get_bank_id_for_deal(user_id=current_user.id, deal_id=deal.id)

    # 3. Call Hindsight recall
    memories_raw, prompt_context, err = await hindsight_service.recall(
        user_id=current_user.id,
        deal_id=deal.id,
        query=payload.query,
        max_tokens=payload.max_tokens or 4096,
        budget=payload.budget or "mid",
    )

    recalled_items = [RecalledMemoryItem(**m) for m in memories_raw]

    return MemoryRecallResponse(
        deal_id=deal.id,
        bank_id=bank_id,
        query=payload.query,
        memories=recalled_items,
        prompt_context=prompt_context,
        count=len(recalled_items),
    )


@router.get(
    "/prepare/{deal_id}",
    response_model=DealPreparationResponse,
    summary="Prepare Deal Memory Context",
    description="Gathers deal state, stakeholders, and recent interactions, then queries Hindsight for past lessons to assemble preparation context for AI agents.",
)
@router.post(
    "/prepare/{deal_id}",
    response_model=DealPreparationResponse,
    summary="Prepare Deal Memory Context (POST alternative)",
)
async def prepare_deal_memory(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Verify deal ownership
    deal = db.execute(
        select(Deal).where(
            Deal.id == deal_id,
            Deal.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not deal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    # 2. Fetch associated account
    account = db.execute(
        select(Account).where(
            Account.id == deal.account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    account_name = account.name if account else "Unknown Account"

    # 3. Fetch deal stakeholders (from the deal's account)
    stakeholders = (
        db.execute(
            select(Stakeholder)
            .where(Stakeholder.account_id == deal.account_id)
            .order_by(Stakeholder.created_at.desc())
        )
        .scalars()
        .all()
    )
    stakeholder_summaries = [
        StakeholderSummary.model_validate(s) for s in stakeholders
    ]

    # 4. Fetch recent interactions for this deal
    interactions = (
        db.execute(
            select(Interaction)
            .where(Interaction.deal_id == deal.id)
            .order_by(Interaction.interaction_date.desc(), Interaction.created_at.desc())
            .limit(10)
        )
        .scalars()
        .all()
    )
    interaction_summaries = [
        InteractionSummary.model_validate(i) for i in interactions
    ]

    # 5. Build contextual recall query
    recall_query = hindsight_service.build_deal_preparation_query(
        deal_name=deal.name,
        stage=deal.stage,
        main_objection=deal.main_objection,
        next_action=deal.next_action,
    )

    # 6. Query Hindsight for experiential memory
    memories_raw, prompt_context, err = await hindsight_service.recall(
        user_id=current_user.id,
        deal_id=deal.id,
        query=recall_query,
    )

    if not hindsight_service.is_configured():
        hindsight_status = "not_configured"
    elif err:
        hindsight_status = "failed"
    else:
        hindsight_status = "recalled"

    recalled_items = [RecalledMemoryItem(**m) for m in memories_raw]

    return DealPreparationResponse(
        deal_id=deal.id,
        deal_name=deal.name,
        account_name=account_name,
        current_stage=deal.stage,
        deal_health=deal.health,
        main_objection=deal.main_objection,
        next_action=deal.next_action,
        stakeholders=stakeholder_summaries,
        recent_interactions=interaction_summaries,
        recall_query=recall_query,
        recalled_memories=recalled_items,
        prompt_context=prompt_context,
        hindsight_status=hindsight_status,
    )
