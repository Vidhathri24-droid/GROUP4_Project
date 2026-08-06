from uuid import UUID
from enum import Enum

from pydantic import BaseModel, ConfigDict


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


class CollaborationCreate(BaseModel):
    researcher1_id: UUID
    researcher2_id: UUID
    publication_id: UUID | None = None
    collaboration_type: CollaborationType
    status: CollaborationStatus = CollaborationStatus.ACTIVE
    description: str | None = None


class CollaborationUpdate(BaseModel):
    collaboration_type: CollaborationType | None = None
    status: CollaborationStatus | None = None
    description: str | None = None
    publication_id: UUID | None = None


class CollaborationResponse(BaseModel):
    id: UUID
    researcher1_id: UUID
    researcher2_id: UUID
    publication_id: UUID | None
    collaboration_type: CollaborationType
    status: CollaborationStatus
    description: str | None

    model_config = ConfigDict(from_attributes=True)
