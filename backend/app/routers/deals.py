import uuid
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
from app.schemas.briefing import DealBriefingResponse
from app.schemas.deal import (
    DealCreate,
    DealUpdate,
    DealResponse,
)
from app.services.groq_service import groq_service
from app.services.hindsight_service import hindsight_service
from groq import GroqError

router = APIRouter(prefix="/deals", tags=["Deals"])


@router.post(
    "",
    response_model=DealResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Deal",
    description="Creates a new deal under an account owned by the authenticated user.",
)
def create_deal(
    payload: DealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the referenced account exists and belongs to the authenticated user
    account = db.execute(
        select(Account).where(
            Account.id == payload.account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    deal = Deal(
        account_id=payload.account_id,
        owner_user_id=current_user.id,
        name=payload.name,
        value=payload.value,
        stage=payload.stage,
        health=payload.health,
        main_objection=payload.main_objection,
        next_action=payload.next_action,
        last_interaction_at=payload.last_interaction_at,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.get(
    "",
    response_model=List[DealResponse],
    summary="List Deals",
    description="Returns all deals owned by the authenticated user, optionally filtered by account_id.",
)
def list_deals(
    account_id: Optional[uuid.UUID] = Query(None, description="Filter deals by account ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Deal).where(Deal.owner_user_id == current_user.id)
    if account_id:
        query = query.where(Deal.account_id == account_id)
    query = query.order_by(Deal.created_at.desc())
    return db.execute(query).scalars().all()


@router.get(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Get Deal",
    description="Retrieves a specific deal by ID. Returns 404 if not found or owned by another user.",
)
def get_deal(
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
    return deal


@router.put(
    "/{deal_id}",
    response_model=DealResponse,
    summary="Update Deal",
    description="Updates a deal's details. Returns 404 if not found or owned by another user.",
)
def update_deal(
    deal_id: uuid.UUID,
    payload: DealUpdate,
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

    update_data = payload.model_dump(exclude_unset=True)

    # If updating account_id, ensure target account belongs to authenticated user
    if "account_id" in update_data and update_data["account_id"] is not None:
        target_account = db.execute(
            select(Account).where(
                Account.id == update_data["account_id"],
                Account.owner_user_id == current_user.id,
            )
        ).scalar_one_or_none()
        if not target_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

    # Disallow updating owner_user_id
    update_data.pop("owner_user_id", None)

    for field, value in update_data.items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete(
    "/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Deal",
    description="Deletes a deal. Returns 404 if not found or owned by another user.",
)
def delete_deal(
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

    db.delete(deal)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{deal_id}/prepare",
    response_model=DealBriefingResponse,
    summary="Generate AI Deal Briefing",
    description=(
        "Retrieves current deal parameters, account data, stakeholders, recent interactions, "
        "and recalled Hindsight experiential memories to generate a grounded AI briefing via Groq."
    ),
)
@router.get(
    "/{deal_id}/prepare",
    response_model=DealBriefingResponse,
    summary="Generate AI Deal Briefing (GET alternative)",
)
async def prepare_deal(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Authenticate user & verify deal ownership
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

    # 2. Load account
    account = db.execute(
        select(Account).where(
            Account.id == deal.account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    account_name = account.name if account else "Unknown Account"
    account_industry = account.industry if account else None
    account_notes = account.notes if account else None

    # 3. Load stakeholders for this account
    stakeholders = (
        db.execute(
            select(Stakeholder)
            .where(Stakeholder.account_id == deal.account_id)
            .order_by(Stakeholder.created_at.desc())
        )
        .scalars()
        .all()
    )
    stakeholder_dicts = [
        {
            "id": str(s.id),
            "name": s.name,
            "role": s.role,
            "email": s.email,
        }
        for s in stakeholders
    ]

    # 4. Load recent interactions
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
    interaction_dicts = [
        {
            "id": str(i.id),
            "type": i.interaction_type,
            "interaction_date": (
                i.interaction_date.strftime("%Y-%m-%d %H:%M UTC")
                if i.interaction_date
                else "Recent"
            ),
            "concern": i.concern,
            "approach": i.approach,
            "outcome": i.outcome,
            "notes": i.notes,
        }
        for i in interactions
    ]

    # 5. Retrieve experiential memory from Hindsight
    recall_query = hindsight_service.build_deal_preparation_query(
        deal_name=deal.name,
        stage=deal.stage,
        main_objection=deal.main_objection,
        next_action=deal.next_action,
    )

    memories_raw, prompt_context, hindsight_err = await hindsight_service.recall(
        user_id=current_user.id,
        deal_id=deal.id,
        query=recall_query,
    )

    if not hindsight_service.is_configured():
        hindsight_status = "not_configured"
    elif hindsight_err:
        hindsight_status = "failed"
    else:
        hindsight_status = "recalled"

    # 6. Verify Groq configuration
    if not groq_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Groq LLM is not configured. Please set GROQ_API_KEY in backend/.env.",
        )

    # 7. Generate grounded briefing via Groq
    try:
        briefing, model_used = await groq_service.generate_deal_briefing(
            deal_name=deal.name,
            deal_value=float(deal.value) if deal.value is not None else None,
            stage=deal.stage,
            health=deal.health,
            main_objection=deal.main_objection,
            next_action=deal.next_action,
            account_name=account_name,
            account_industry=account_industry,
            account_notes=account_notes,
            stakeholders=stakeholder_dicts,
            recent_interactions=interaction_dicts,
            recalled_memories=memories_raw,
            hindsight_prompt_context=prompt_context,
        )
    except GroqError as ge:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Groq AI briefing generation failed due to an API error.",
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq AI returned an invalid or unparseable structured briefing: {ve}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the AI deal briefing.",
        )

    return DealBriefingResponse(
        deal_id=deal.id,
        deal_name=deal.name,
        account_name=account_name,
        hindsight_status=hindsight_status,
        recalled_memories_count=len(memories_raw),
        model=model_used,
        briefing=briefing,
        error=hindsight_err,
    )

