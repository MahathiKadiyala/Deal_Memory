from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    UserResponse,
    AuthResponse,
    LogoutResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="User Registration",
    description="Registers a new user account with hashed password and returns an auth token.",
)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check for duplicate email
    existing_user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Hash the password securely with bcrypt
    hashed_pwd = hash_password(payload.password)

    # Persist the new user
    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hashed_pwd,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT access token
    access_token = create_access_token(subject=str(new_user.id))

    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        access_token=access_token,
        token_type="bearer",
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="User Login",
    description="Authenticates with email and password and returns a JWT access token.",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))

    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User Profile",
    description="Returns the profile information of the currently authenticated user.",
)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="User Logout",
    description="Stateless logout response instructing client to clear stored JWT token.",
)
def logout():
    return LogoutResponse(message="Successfully logged out.")
