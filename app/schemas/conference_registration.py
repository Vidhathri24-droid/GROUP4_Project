from uuid import UUID
from enum import Enum
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ParticipationType(str, Enum):
    ATTENDEE = "Attendee"
    PRESENTER = "Presenter"


class RegistrationStatus(str, Enum):
    APPROVED = "Approved"
    PENDING = "Pending"
    REJECTED = "Rejected"


class ConferenceRegistrationCreate(BaseModel):
    participation_type: ParticipationType = (
        ParticipationType.ATTENDEE
    )


class ConferenceRegistrationResponse(BaseModel):
    id: UUID
    conference_id: UUID
    user_id: UUID
    participation_type: ParticipationType
    status: RegistrationStatus
    reminder_sent_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )