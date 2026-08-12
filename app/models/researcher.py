import uuid

from sqlalchemy import (
    String,
    Integer,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.db.database import Base
from app.models.base_model import TimestampMixin


class Researcher(TimestampMixin, Base):
    __tablename__ = "researchers"

    __table_args__ = (
        UniqueConstraint(
            "orcid",
            name="uq_researcher_orcid",
        ),
        CheckConstraint(
            "experience >= 0",
            name="ck_experience_positive",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
    )

    # Institution is optional during registration
    institution_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "institutions.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    experience: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    orcid: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    google_scholar: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    research_gate: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    linkedin: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="researcher",
    )

    institution = relationship(
        "Institution",
        back_populates="researchers",
    )

    departments = relationship(
        "Department",
        secondary="researcher_departments",
        back_populates="researchers",
    )

    publications = relationship(
        "Publication",
        secondary="publication_authors",
        back_populates="researchers",
    )