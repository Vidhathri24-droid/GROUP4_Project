import enum
import uuid

from sqlalchemy import (
    String,
    Integer,
    Text,
    Enum,
    CheckConstraint,
    UniqueConstraint,
    ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base
from app.models.base_model import TimestampMixin


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
            name="ck_citation_count_positive",
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
    )

    doi: Mapped[str | None] = mapped_column(
        String(255),
    )

    journal: Mapped[str | None] = mapped_column(
        String(255),
    )

    conference: Mapped[str | None] = mapped_column(
        String(255),
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
        default=PublicationStatus.DRAFT,
        nullable=False,
    )

    url: Mapped[str | None] = mapped_column(
        String(500),
    )

    citation_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    # File upload information
    file_name: Mapped[str | None] = mapped_column(
        String(255),
    )

    file_path: Mapped[str | None] = mapped_column(
        String(500),
    )

    file_size: Mapped[int | None] = mapped_column(
        Integer,
    )

    file_type: Mapped[str | None] = mapped_column(
        String(100),
    )

    researchers = relationship(
        "Researcher",
        secondary="publication_authors",
        back_populates="publications",
	lazy="selectin",
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
    	UUID(as_uuid=True),
    	ForeignKey("users.id", ondelete="CASCADE"),
    	nullable=True,
    )

    owner = relationship(
    	"User",
    	back_populates="publications",
	lazy="joined",
    )
