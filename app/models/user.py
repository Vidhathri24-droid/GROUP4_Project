import uuid
import enum

from datetime import datetime

from sqlalchemy import (
    UniqueConstraint,
    String,
    Boolean,
    Enum,
    DateTime,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import TimestampMixin
from app.db.database import Base


class UserRole(str, enum.Enum):
    RESEARCHER = "Researcher"
    REVIEWER = "Reviewer"
    INSTITUTION_ADMIN = "InstitutionAdmin"
    SYSTEM_ADMIN = "SystemAdmin"


class User(TimestampMixin, Base):

    __tablename__ = "users"

    __table_args__ = (
        UniqueConstraint(
            "email",
            name="uq_user_email"
        ),
        UniqueConstraint(
            "username",
            name="uq_user_username"
        ),
    )

    # ---------------------------------------------------------
    # ID
    # ---------------------------------------------------------

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # ---------------------------------------------------------
    # Username
    # ---------------------------------------------------------

    username: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True
    )

    # ---------------------------------------------------------
    # Email
    # ---------------------------------------------------------

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    # ---------------------------------------------------------
    # Password
    # ---------------------------------------------------------

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # ---------------------------------------------------------
    # Role
    # ---------------------------------------------------------

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        default=UserRole.RESEARCHER,
        nullable=False
    )

    # ---------------------------------------------------------
    # Account status
    # ---------------------------------------------------------

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # ---------------------------------------------------------
    # Email verification
    # ---------------------------------------------------------

    verification_token: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    verification_token_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Email OTP
    email_otp: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    email_otp_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # ---------------------------------------------------------
    # Phone
    # ---------------------------------------------------------

    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        unique=True,
        nullable=True,
        index=True
    )

    phone_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    phone_verification_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Phone OTP
    phone_otp: Mapped[str | None] = mapped_column(
        String(6),
        nullable=True
    )

    phone_otp_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # ---------------------------------------------------------
    # Password reset
    # ---------------------------------------------------------

    password_reset_token: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    password_reset_expiry: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    researcher = relationship(
        "Researcher",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False
    )

    publications = relationship(
        "Publication",
        foreign_keys="Publication.owner_id",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    reviewed_publications = relationship(
        "Publication",
        foreign_keys="Publication.reviewed_by",
        back_populates="reviewer",
    )

    conference_registrations = relationship(
        "ConferenceRegistration",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    created_conferences = relationship(
        "Conference",
        foreign_keys="Conference.created_by",
        back_populates="creator",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    sent_collaborations = relationship(
        "Collaboration",
        foreign_keys="Collaboration.sender_id",
        back_populates="sender",
        cascade="all, delete",
    )

    received_collaborations = relationship(
        "Collaboration",
        foreign_keys="Collaboration.receiver_id",
        back_populates="receiver",
        cascade="all, delete",
    )