from uuid import UUID
from enum import Enum

from pydantic import BaseModel, ConfigDict


class ParticipationType(str, Enum):
    ATTENDEE = "Attendee"
    PRESENTER = "Presenter"


class ConferenceRegistrationCreate(BaseModel):
    participation_type: ParticipationType = ParticipationType.ATTENDEE


class ConferenceRegistrationResponse(BaseModel):
    id: UUID
    conference_id: UUID
    user_id: UUID
    participation_type: ParticipationType

    model_config = ConfigDict(from_attributes=True)