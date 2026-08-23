import uuid

from datetime import date, time

from sqlalchemy import (
    String,
    Date,
    Time,
    Text,
    ForeignKey,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.base_model import TimestampMixin


class Conference(TimestampMixin, Base):
    __tablename__ = "conferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    conference_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    conference_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ---------------------------------------------------------
    # Admin who created the conference
    # ---------------------------------------------------------

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    creator = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_conferences",
    )

    registrations = relationship(
        "ConferenceRegistration",
        back_populates="conference",
        cascade="all, delete-orphan",
    )