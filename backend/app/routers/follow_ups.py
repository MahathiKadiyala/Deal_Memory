import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.deal import Deal
from app.models.follow_up import FollowUp
from app.models.stakeholder import Stakeholder
from app.models.user import User
from app.schemas.follow_up import (
    FollowUpCreate,
    FollowUpUpdate,
    FollowUpResponse,
)

router = APIRouter(prefix="/follow-ups", tags=["Follow-ups"])


@router.post(
    "",
    response_model=FollowUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Follow-up",
    description="Creates a new follow-up action item. Validates ownership of all referenced resources.",
)
def create_follow_up(
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deal: Optional[Deal] = None

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

    follow_up = FollowUp(
        deal_id=deal.id if deal else None,
        account_id=account.id,
        stakeholder_id=payload.stakeholder_id,
        title=payload.title,
        due_at=payload.due_at,
        priority=payload.priority or "Medium",
        status=payload.status or "Pending",
        notes=payload.notes,
    )
    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.get(
    "",
    response_model=List[FollowUpResponse],
    summary="List Follow-ups",
    description="Returns all follow-ups belonging to the authenticated user, optionally filtered by deal_id, account_id, or status.",
)
def list_follow_ups(
    deal_id: Optional[uuid.UUID] = Query(None, description="Filter by deal ID"),
    account_id: Optional[uuid.UUID] = Query(None, description="Filter by account ID"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. Pending, Completed)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(FollowUp)
        .join(Account, FollowUp.account_id == Account.id)
        .where(Account.owner_user_id == current_user.id)
    )
    if deal_id:
        query = query.where(FollowUp.deal_id == deal_id)
    if account_id:
        query = query.where(FollowUp.account_id == account_id)
    if status:
        query = query.where(FollowUp.status == status)
    query = query.order_by(
        FollowUp.due_at.asc().nulls_last(),
        FollowUp.created_at.desc(),
    )
    return db.execute(query).scalars().all()


@router.get(
    "/{follow_up_id}",
    response_model=FollowUpResponse,
    summary="Get Follow-up",
    description="Retrieves a specific follow-up by ID. Returns 404 if not found or owned by another user.",
)
def get_follow_up(
    follow_up_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follow_up = db.execute(
        select(FollowUp)
        .join(Account, FollowUp.account_id == Account.id)
        .where(
            FollowUp.id == follow_up_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow-up not found",
        )
    return follow_up


@router.put(
    "/{follow_up_id}",
    response_model=FollowUpResponse,
    summary="Update Follow-up",
    description="Updates follow-up details. Validates ownership of any modified relationships.",
)
def update_follow_up(
    follow_up_id: uuid.UUID,
    payload: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follow_up = db.execute(
        select(FollowUp)
        .join(Account, FollowUp.account_id == Account.id)
        .where(
            FollowUp.id == follow_up_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow-up not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Validate target account if updating
    target_account_id = update_data.get("account_id", follow_up.account_id)
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

    # Validate deal if updating
    target_deal_id = update_data.get("deal_id", follow_up.deal_id)
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

    # Validate stakeholder if updating
    target_stakeholder_id = update_data.get("stakeholder_id", follow_up.stakeholder_id)
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
        setattr(follow_up, field, value)

    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.delete(
    "/{follow_up_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Follow-up",
    description="Deletes a follow-up. Returns 404 if not found or owned by another user.",
)
def delete_follow_up(
    follow_up_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follow_up = db.execute(
        select(FollowUp)
        .join(Account, FollowUp.account_id == Account.id)
        .where(
            FollowUp.id == follow_up_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not follow_up:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Follow-up not found",
        )

    db.delete(follow_up)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
