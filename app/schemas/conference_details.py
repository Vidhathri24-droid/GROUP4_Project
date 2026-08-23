from uuid import UUID
from datetime import date, time

from pydantic import BaseModel


# ============================================================
# PRESENTER
# ============================================================

class ConferencePresenter(BaseModel):
    id: UUID
    name: str


# ============================================================
# ATTENDEE
# ============================================================

class ConferenceAttendee(BaseModel):
    id: UUID
    name: str


# ============================================================
# CONFERENCE DETAILS
# ============================================================

class ConferenceDetailsResponse(BaseModel):
    id: UUID
    title: str

    location: str | None = None

    conference_date: date | None = None

    conference_time: time | None = None

    description: str | None = None

    participant_count: int = 0

    is_registered: bool = False

    presenters: list[ConferencePresenter] = []

    attendees: list[ConferenceAttendee] = []