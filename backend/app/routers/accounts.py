import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.account import Account
from app.models.user import User
from app.schemas.account import (
    AccountCreate,
    AccountUpdate,
    AccountResponse,
)

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.post(
    "",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Account",
    description="Creates a new account owned by the authenticated user.",
)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = Account(
        owner_user_id=current_user.id,
        name=payload.name,
        industry=payload.industry,
        primary_contact=payload.primary_contact,
        contact_email=payload.contact_email,
        notes=payload.notes,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get(
    "",
    response_model=List[AccountResponse],
    summary="List Accounts",
    description="Returns all accounts owned by the authenticated user.",
)
def list_accounts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    accounts = (
        db.execute(
            select(Account)
            .where(Account.owner_user_id == current_user.id)
            .order_by(Account.created_at.desc())
        )
        .scalars()
        .all()
    )
    return accounts


@router.get(
    "/{account_id}",
    response_model=AccountResponse,
    summary="Get Account",
    description="Retrieves a specific account by ID. Returns 404 if not found or owned by another user.",
)
def get_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = db.execute(
        select(Account).where(
            Account.id == account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )
    return account


@router.put(
    "/{account_id}",
    response_model=AccountResponse,
    summary="Update Account",
    description="Updates account attributes. Returns 404 if not found or owned by another user.",
)
def update_account(
    account_id: uuid.UUID,
    payload: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = db.execute(
        select(Account).where(
            Account.id == account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)
    return account


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Account",
    description="Deletes an account and cascades to associated deals, stakeholders, interactions, and follow-ups. Returns 404 if not found or owned by another user.",
)
def delete_account(
    account_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    account = db.execute(
        select(Account).where(
            Account.id == account_id,
            Account.owner_user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    db.delete(account)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
