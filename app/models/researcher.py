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
from app.models.collaboration import Collaboration

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

    first_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    phone: Mapped[str | None] = mapped_column(
        String(20),
    )

    experience: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    orcid: Mapped[str | None] = mapped_column(
        String(50),
    )

    google_scholar: Mapped[str | None] = mapped_column(
        String(500),
    )

    research_gate: Mapped[str | None] = mapped_column(
        String(500),
    )

    linkedin: Mapped[str | None] = mapped_column(
        String(500),
    )

    bio: Mapped[str | None] = mapped_column(
        String(1000),
    )

    user = relationship(
        "User",
        back_populates="researcher",
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

    collaborations_as_first = relationship(
        "Collaboration",
        foreign_keys="Collaboration.researcher1_id",
	back_populates="researcher1",
        cascade="all, delete",
    )

    collaborations_as_second = relationship(
        "Collaboration",
        foreign_keys="Collaboration.researcher2_id",
	back_populates="researcher2",
        cascade="all, delete",
    )
