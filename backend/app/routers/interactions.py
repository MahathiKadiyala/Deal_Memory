import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.deal import Deal
from app.models.interaction import Interaction
from app.models.stakeholder import Stakeholder
from app.models.user import User
from app.schemas.interaction import (
    InteractionCreate,
    InteractionUpdate,
    InteractionResponse,
)

from app.services.hindsight_service import hindsight_service

router = APIRouter(tags=["Interactions"])


@router.post(
    "/interactions",
    response_model=InteractionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Interaction",
    description="Logs a sales interaction, validates ownership, updates deal.last_interaction_at, and retains experiential memory in Hindsight.",
)
async def create_interaction(
    payload: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal: Optional[Deal] = None
    account: Optional[Account] = None
    stakeholder: Optional[Stakeholder] = None

    # 1. Validate deal ownership if provided
    if payload.deal_id:
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

    # 2. Determine and validate account ownership
    target_account_id = payload.account_id or (deal.account_id if deal else None)
    if not target_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either account_id or deal_id must be provided",
        )

    # If both deal and account_id were supplied, ensure they match
    if deal and payload.account_id and deal.account_id != payload.account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deal does not belong to the specified account",
        )

    account = db.execute(
        select(Account).where(
            Account.id == target_account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    # 3. Validate stakeholder belongs to the verified account when provided
    if payload.stakeholder_id:
        stakeholder = db.execute(
            select(Stakeholder).where(
                Stakeholder.id == payload.stakeholder_id,
                Stakeholder.account_id == account.id,
            )
        ).scalar_one_or_none()
        if not stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stakeholder not found for this account",
            )

    interaction_date = payload.interaction_date or datetime.now(timezone.utc)

    # 4. Create and persist the interaction to PostgreSQL
    interaction = Interaction(
        deal_id=deal.id if deal else None,
        account_id=account.id,
        stakeholder_id=payload.stakeholder_id,
        interaction_type=payload.interaction_type,
        interaction_date=interaction_date,
        concern=payload.concern,
        approach=payload.approach,
        outcome=payload.outcome or "Neutral",
        notes=payload.notes,
    )
    db.add(interaction)

    # 5. DEAL-SPECIFIC BEHAVIOR: Update deal.last_interaction_at using interaction_date
    if deal:
        deal.last_interaction_at = interaction_date
        db.add(deal)

    db.commit()
    db.refresh(interaction)

    # 6. HINDSIGHT EXPERIENTIAL MEMORY RETENTION
    memory_sync_status: Optional[str] = None
    memory_error: Optional[str] = None

    if deal:
        memory_content = hindsight_service.format_interaction_memory(
            account_name=account.name,
            deal_name=deal.name,
            stakeholder_name=stakeholder.name if stakeholder else None,
            stakeholder_role=stakeholder.role if stakeholder else None,
            interaction_type=interaction.interaction_type,
            interaction_date=interaction.interaction_date,
            concern=interaction.concern,
            approach=interaction.approach,
            outcome=interaction.outcome,
            notes=interaction.notes,
        )

        _, sync_status, err = await hindsight_service.retain(
            user_id=current_user.id,
            deal_id=deal.id,
            content=memory_content,
            context=f"Deal Stage: {deal.stage}, Deal Health: {deal.health}",
            document_id=str(interaction.id),
            timestamp=interaction.interaction_date,
        )
        memory_sync_status = sync_status
        memory_error = err
    else:
        memory_sync_status = "skipped"

    # Build response with memory sync metadata
    response = InteractionResponse.model_validate(interaction)
    response.memory_sync_status = memory_sync_status
    response.memory_error = memory_error
    return response


@router.get(
    "/deals/{deal_id}/interactions",
    response_model=List[InteractionResponse],
    summary="Get Interactions for Deal",
    description="Returns all logged interactions for a specific deal. Returns 404 if deal not found or owned by another user.",
)
def get_deal_interactions(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    interactions = (
        db.execute(
            select(Interaction)
            .where(Interaction.deal_id == deal_id)
            .order_by(
                Interaction.interaction_date.desc(),
                Interaction.created_at.desc(),
            )
        )
        .scalars()
        .all()
    )
    return interactions


@router.get(
    "/interactions",
    response_model=List[InteractionResponse],
    summary="List Interactions",
    description="Lists all interactions belonging to accounts owned by the authenticated user, optionally filtered by deal_id or account_id.",
)
def list_interactions(
    deal_id: Optional[uuid.UUID] = Query(None, description="Filter interactions by deal ID"),
    account_id: Optional[uuid.UUID] = Query(None, description="Filter interactions by account ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Interaction)
        .join(Account, Interaction.account_id == Account.id)
        .where(Account.owner_user_id == current_user.id)
    )
    if deal_id:
        query = query.where(Interaction.deal_id == deal_id)
    if account_id:
        query = query.where(Interaction.account_id == account_id)
    query = query.order_by(
        Interaction.interaction_date.desc(),
        Interaction.created_at.desc(),
    )
    return db.execute(query).scalars().all()


@router.get(
    "/interactions/{interaction_id}",
    response_model=InteractionResponse,
    summary="Get Interaction",
    description="Retrieves a specific interaction by ID. Returns 404 if not found or owned by another user.",
)
def get_interaction(
    interaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = db.execute(
        select(Interaction)
        .join(Account, Interaction.account_id == Account.id)
        .where(
            Interaction.id == interaction_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )
    return interaction


@router.put(
    "/interactions/{interaction_id}",
    response_model=InteractionResponse,
    summary="Update Interaction",
    description="Updates interaction details. Returns 404 if not found or owned by another user.",
)
def update_interaction(
    interaction_id: uuid.UUID,
    payload: InteractionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = db.execute(
        select(Interaction)
        .join(Account, Interaction.account_id == Account.id)
        .where(
            Interaction.id == interaction_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Target account validation if changed
    target_account_id = update_data.get("account_id", interaction.account_id)
    if "account_id" in update_data and update_data["account_id"] is not None:
        target_account = db.execute(
            select(Account).where(
                Account.id == target_account_id,
                Account.owner_user_id == current_user.id,
            )
        ).scalar_one_or_none()
        if not target_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

    # Deal validation if changed
    target_deal_id = update_data.get("deal_id", interaction.deal_id)
    target_deal = None
    if target_deal_id:
        target_deal = db.execute(
            select(Deal).where(
                Deal.id == target_deal_id,
                Deal.owner_user_id == current_user.id,
            )
        ).scalar_one_or_none()
        if not target_deal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deal not found",
            )
        if target_deal.account_id != target_account_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deal does not belong to the specified account",
            )

    # Stakeholder validation if changed
    target_stakeholder_id = update_data.get("stakeholder_id", interaction.stakeholder_id)
    if target_stakeholder_id:
        target_stakeholder = db.execute(
            select(Stakeholder).where(
                Stakeholder.id == target_stakeholder_id,
                Stakeholder.account_id == target_account_id,
            )
        ).scalar_one_or_none()
        if not target_stakeholder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stakeholder not found for this account",
            )

    for field, value in update_data.items():
        setattr(interaction, field, value)

    # If interaction_date changed and linked to a deal, update deal last_interaction_at
    if "interaction_date" in update_data and target_deal:
        target_deal.last_interaction_at = interaction.interaction_date
        db.add(target_deal)

    db.commit()
    db.refresh(interaction)
    return interaction


@router.delete(
    "/interactions/{interaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Interaction",
    description="Deletes an interaction. Returns 404 if not found or owned by another user.",
)
def delete_interaction(
    interaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interaction = db.execute(
        select(Interaction)
        .join(Account, Interaction.account_id == Account.id)
        .where(
            Interaction.id == interaction_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interaction not found",
        )

    db.delete(interaction)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
