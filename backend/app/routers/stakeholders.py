import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.deal import Deal
from app.models.stakeholder import Stakeholder
from app.models.user import User
from app.schemas.stakeholder import (
    StakeholderCreate,
    StakeholderUpdate,
    StakeholderResponse,
)

router = APIRouter(tags=["Stakeholders"])


@router.post(
    "/stakeholders",
    response_model=StakeholderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Stakeholder",
    description="Creates a new stakeholder under an account owned by the authenticated user.",
)
def create_stakeholder(
    payload: StakeholderCreate,
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

    stakeholder = Stakeholder(
        account_id=payload.account_id,
        name=payload.name,
        role=payload.role,
        email=payload.email,
    )
    db.add(stakeholder)
    db.commit()
    db.refresh(stakeholder)
    return stakeholder


@router.get(
    "/deals/{deal_id}/stakeholders",
    response_model=List[StakeholderResponse],
    summary="Get Stakeholders for Deal",
    description="Retrieves all stakeholders associated with the account of the specified deal. Returns 404 if deal not found or owned by another user.",
)
def get_deal_stakeholders(
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify deal exists and belongs to the authenticated user
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

    stakeholders = (
        db.execute(
            select(Stakeholder)
            .where(Stakeholder.account_id == deal.account_id)
            .order_by(Stakeholder.created_at.desc())
        )
        .scalars()
        .all()
    )
    return stakeholders


@router.get(
    "/stakeholders",
    response_model=List[StakeholderResponse],
    summary="List Stakeholders",
    description="Lists all stakeholders belonging to accounts owned by the authenticated user, optionally filtered by account_id.",
)
def list_stakeholders(
    account_id: Optional[uuid.UUID] = Query(None, description="Filter stakeholders by account ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Stakeholder)
        .join(Account, Stakeholder.account_id == Account.id)
        .where(Account.owner_user_id == current_user.id)
    )
    if account_id:
        query = query.where(Stakeholder.account_id == account_id)
    query = query.order_by(Stakeholder.created_at.desc())
    return db.execute(query).scalars().all()


@router.get(
    "/stakeholders/{stakeholder_id}",
    response_model=StakeholderResponse,
    summary="Get Stakeholder",
    description="Retrieves a specific stakeholder by ID. Returns 404 if not found or owned by another user.",
)
def get_stakeholder(
    stakeholder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stakeholder = db.execute(
        select(Stakeholder)
        .join(Account, Stakeholder.account_id == Account.id)
        .where(
            Stakeholder.id == stakeholder_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not stakeholder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stakeholder not found",
        )
    return stakeholder


@router.put(
    "/stakeholders/{stakeholder_id}",
    response_model=StakeholderResponse,
    summary="Update Stakeholder",
    description="Updates a stakeholder's details. Returns 404 if not found or owned by another user.",
)
def update_stakeholder(
    stakeholder_id: uuid.UUID,
    payload: StakeholderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stakeholder = db.execute(
        select(Stakeholder)
        .join(Account, Stakeholder.account_id == Account.id)
        .where(
            Stakeholder.id == stakeholder_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not stakeholder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stakeholder not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # If updating account_id, ensure new account belongs to authenticated user
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

    for field, value in update_data.items():
        setattr(stakeholder, field, value)

    db.commit()
    db.refresh(stakeholder)
    return stakeholder


@router.delete(
    "/stakeholders/{stakeholder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Stakeholder",
    description="Deletes a stakeholder. Returns 404 if not found or owned by another user.",
)
def delete_stakeholder(
    stakeholder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stakeholder = db.execute(
        select(Stakeholder)
        .join(Account, Stakeholder.account_id == Account.id)
        .where(
            Stakeholder.id == stakeholder_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not stakeholder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stakeholder not found",
        )

    db.delete(stakeholder)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
