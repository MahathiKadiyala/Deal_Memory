import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    owner_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False, default=Decimal("0.00"))
    stage: Mapped[str] = mapped_column(String(50), nullable=False, default="Discovery")
    health: Mapped[str] = mapped_column(String(50), nullable=False, default="Healthy")
    main_objection: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    next_action: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    last_interaction_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    account: Mapped["Account"] = relationship("Account", back_populates="deals")
    owner: Mapped[Optional["User"]] = relationship("User", back_populates="deals")
    interactions: Mapped[List["Interaction"]] = relationship(
        "Interaction", back_populates="deal", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        "FollowUp", back_populates="deal", cascade="all, delete-orphan"
    )
