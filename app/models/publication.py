import enum
import uuid

from sqlalchemy import (
    String,
    Integer,
    Text,
    Enum,
    CheckConstraint,
    UniqueConstraint,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base
from app.models.base_model import TimestampMixin
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class PublicationType(str, enum.Enum):
    JOURNAL = "Journal"
    CONFERENCE = "Conference"
    BOOK = "Book"
    BOOK_CHAPTER = "BookChapter"
    PATENT = "Patent"
    THESIS = "Thesis"


class PublicationStatus(str, enum.Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    ACCEPTED = "Accepted"
    PUBLISHED = "Published"
    REJECTED = "Rejected"


class Publication(TimestampMixin, Base):
    __tablename__ = "publications"

    __table_args__ = (
        UniqueConstraint(
            "doi",
            name="uq_publication_doi",
        ),
        CheckConstraint(
            "citation_count >= 0",
            name="ck_publication_citation_count_positive",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    abstract: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    doi: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    journal: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    conference: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    publication_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    publication_type: Mapped[PublicationType] = mapped_column(
        Enum(PublicationType),
        nullable=False,
    )

    status: Mapped[PublicationStatus] = mapped_column(
        Enum(PublicationStatus),
        nullable=False,
        default=PublicationStatus.SUBMITTED,
    )

    url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    citation_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    file_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    file_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    file_size: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    file_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    owner = relationship(
        "User",
        foreign_keys=[owner_id],
        back_populates="publications",
    )

    researchers = relationship(
        "Researcher",
        secondary="publication_authors",
        back_populates="publications",
    )

    citations = relationship(
    	"Citation",
    	back_populates="publication",
    	cascade="all, delete-orphan",
    )

    collaborations = relationship(
        "Collaboration",
        back_populates="publication",
        cascade="all, delete",
    )
    reviewed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )
    
    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
        back_populates="reviewed_publications",
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
    )

    reviewer_comment = Column(
        Text,
        nullable=True,
    )
