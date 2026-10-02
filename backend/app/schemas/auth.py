import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    email: EmailStr = Field(..., description="Valid unique email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (at least 8 characters)")

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("name", mode="after")
    @classmethod
    def clean_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty or only whitespace")
        return cleaned


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class LogoutResponse(BaseModel):
    message: str = "Successfully logged out"
