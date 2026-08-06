import uuid
<<<<<<< HEAD
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
=======
import enum

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab

from app.db.database import Base
from app.models.base_model import TimestampMixin


<<<<<<< HEAD
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
=======
class CollaborationStatus(str, enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab


class Collaboration(TimestampMixin, Base):
    __tablename__ = "collaborations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

<<<<<<< HEAD
    researcher1_id: Mapped[uuid.UUID] = mapped_column(
=======
    sender_id: Mapped[uuid.UUID] = mapped_column(
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
        UUID(as_uuid=True),
        ForeignKey(
            "researchers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

<<<<<<< HEAD
    researcher2_id: Mapped[uuid.UUID] = mapped_column(
=======
    receiver_id: Mapped[uuid.UUID] = mapped_column(
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
        UUID(as_uuid=True),
        ForeignKey(
            "researchers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

<<<<<<< HEAD
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
=======
    status: Mapped[CollaborationStatus] = mapped_column(
        Enum(CollaborationStatus),
        default=CollaborationStatus.PENDING,
        nullable=False,
    )

    sender = relationship(
        "Researcher",
        foreign_keys=[sender_id],
    )

    receiver = relationship(
        "Researcher",
        foreign_keys=[receiver_id],
    )
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
