import uuid
from enum import Enum

from sqlalchemy import (
    String,
    ForeignKey,
    Enum as SqlEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base
from app.models.base_model import TimestampMixin


class CollaborationType(str, Enum):
    COAUTHOR = "Co-Author"
    PROJECT = "Project"
    SUPERVISION = "Supervision"
    FUNDING = "Funding"
    OTHER = "Other"


class CollaborationStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class Collaboration(TimestampMixin, Base):
    __tablename__ = "collaborations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False,
    )

    receiver_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("researchers.id", ondelete="CASCADE"),
        nullable=False,
    )

    publication_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("publications.id", ondelete="SET NULL"),
        nullable=True,
    )

    collaboration_type: Mapped[CollaborationType] = mapped_column(
        SqlEnum(
            CollaborationType,
            native_enum=False,
            length=50,
        ),
        default=CollaborationType.PROJECT,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    status: Mapped[CollaborationStatus] = mapped_column(
        SqlEnum(
            CollaborationStatus,
            native_enum=False,
            length=50,
        ),
        default=CollaborationStatus.PENDING,
        nullable=False,
    )

    sender = relationship(
        "Researcher",
        foreign_keys=[sender_id],
	back_populates="sent_collaborations",
    )

    receiver = relationship(
        "Researcher",
        foreign_keys=[receiver_id],
	back_populates="received_collaborations",
    )

    publication = relationship(
        "Publication",
        back_populates="collaborations",
    )
