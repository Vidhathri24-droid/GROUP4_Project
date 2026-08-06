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
    ACTIVE = "Active"
    COMPLETED = "Completed"
    PENDING = "Pending"


class Collaboration(TimestampMixin, Base):
    __tablename__ = "collaborations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    researcher1_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "researchers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    researcher2_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "researchers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    publication_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "publications.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    collaboration_type: Mapped[CollaborationType] = mapped_column(
        SqlEnum(CollaborationType),
        default=CollaborationType.COAUTHOR,
    )

    status: Mapped[CollaborationStatus] = mapped_column(
        SqlEnum(CollaborationStatus),
        default=CollaborationStatus.ACTIVE,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
    )

    researcher1 = relationship(
        "Researcher",
        foreign_keys=[researcher1_id],
	back_populates="collaborations_as_first",
    )

    researcher2 = relationship(
        "Researcher",
        foreign_keys=[researcher2_id],
	back_populates="collaborations_as_second",
    )

    publication = relationship(
        "Publication",
	back_populates="collaborations"
    )
