from uuid import uuid4
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Citation(Base):
    __tablename__ = "citations"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    publication_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "publications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    authors = Column(
        String,
        nullable=False,
    )

    journal = Column(
        String,
    )

    year = Column(
        Integer,
    )

    volume = Column(
        String,
    )

    issue = Column(
        String,
    )

    pages = Column(
        String,
    )

    doi = Column(
        String,
        unique=True,
    )

    url = Column(
        String,
    )

    citation_style = Column(
        String,
    )

    formatted_citation = Column(
        Text,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    publication = relationship(
        "Publication",
        back_populates="citations",
    )
