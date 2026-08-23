import uuid
from enum import Enum
from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    UniqueConstraint,
    String,
    DateTime,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base
from app.models.base_model import TimestampMixin


class ParticipationType(str, Enum):
    ATTENDEE = "Attendee"
    PRESENTER = "Presenter"


class RegistrationStatus(str, Enum):
    APPROVED = "Approved"
    PENDING = "Pending"
    REJECTED = "Rejected"


class ConferenceRegistration(
    TimestampMixin,
    Base,
):
    __tablename__ = "conference_registrations"

    __table_args__ = (
        UniqueConstraint(
            "conference_id",
            "user_id",
            name="uq_conference_user",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    conference_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "conferences.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    participation_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ParticipationType.ATTENDEE.value,
    )

    # ---------------------------------------------------------
    # Presenter approval status
    # ---------------------------------------------------------

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=RegistrationStatus.APPROVED.value,
    )

    # ---------------------------------------------------------
    # Conference reminder tracking
    # ---------------------------------------------------------

    reminder_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    conference = relationship(
        "Conference",
        back_populates="registrations",
    )

    user = relationship(
        "User",
        back_populates="conference_registrations",
    )