from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
)

from app.models.conference_registration import (
    ConferenceRegistration,
    ParticipationType,
)

from app.models.user import User, UserRole

from app.schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse,
)

from app.schemas.conference_registration import (
    ConferenceRegistrationCreate,
    ConferenceRegistrationResponse,
)

from app.services.conference_service import ConferenceService
from app.services.conference_registration_service import (
    ConferenceRegistrationService,
)
from app.services.conference_notification_scheduler import (
    start_conference_notification_scheduler,
)
from app.schemas.conference_registration import (
    ConferenceRegistrationCreate,
    ConferenceRegistrationResponse,
)
from app.schemas.conference_details import ConferenceDetailsResponse

router = APIRouter(
    prefix="/conferences",
    tags=["Conferences"],
)


# ==========================================
# Conference CRUD
# ==========================================

@router.post(
    "/",
    response_model=ConferenceResponse,
    status_code=201,
)
def create_conference(
    conference: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceService.create_conference(
        db=db,
        data=conference,
        current_user=current_user,
    )

# ==========================================
# Export Conference Participants
# ==========================================

@router.get(
    "/{conference_id}/export",
)
def export_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ----------------------------------------------------------
    # Only System Admin and Institution Admin can export
    # ----------------------------------------------------------

    if current_user.role not in [
        UserRole.SYSTEM_ADMIN,
        UserRole.INSTITUTION_ADMIN,
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only System Admin and Institution Admin "
                "can export conference details."
            ),
        )

    # ----------------------------------------------------------
    # Get conference
    # ----------------------------------------------------------

    conference = ConferenceService.get_conference(
        db=db,
        conference_id=conference_id,
    )

    if conference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conference not found.",
        )

    # ----------------------------------------------------------
    # Get all registrations
    # ----------------------------------------------------------

    registrations = (
        db.query(ConferenceRegistration)
        .filter(
            ConferenceRegistration.conference_id
            == conference_id
        )
        .all()
    )

    attendees = []
    presenters = []

    # ----------------------------------------------------------
    # Build participant information
    # ----------------------------------------------------------

    for registration in registrations:

        user = registration.user

        if user is None:
            continue

        # ----------------------------------------------
        # Determine researcher name
        # ----------------------------------------------

        name = user.email or "Unknown"

        if (
            hasattr(user, "researcher")
            and user.researcher
        ):
            first_name = (
                user.researcher.first_name or ""
            )

            last_name = (
                user.researcher.last_name or ""
            )

            full_name = (
                f"{first_name} {last_name}"
            ).strip()

            if full_name:
                name = full_name

        # ----------------------------------------------
        # Participant record
        # ----------------------------------------------

        participant = {
            "registration_id": str(
                registration.id
            ),
            "user_id": str(
                user.id
            ),
            "name": name,
            "email": user.email,
            "participation_type": (
                registration.participation_type
            ),
            "status": registration.status,
        }

        # ----------------------------------------------
        # Separate attendees and presenters
        # ----------------------------------------------

        if (
            registration.participation_type
            == ParticipationType.PRESENTER.value
        ):
            presenters.append(participant)

        else:
            attendees.append(participant)

    # ----------------------------------------------------------
    # Return complete export data
    # ----------------------------------------------------------

    return {
        "conference": {
            "id": str(conference.id),
            "title": conference.title,
            "location": conference.location,
            "conference_date": (
                str(conference.conference_date)
                if conference.conference_date
                else None
            ),
            "conference_time": (
                str(conference.conference_time)
                if conference.conference_time
                else None
            ),
            "description": conference.description,
        },

        "attendees": attendees,

        "presenters": presenters,

        "total_attendees": len(attendees),

        "total_presenters": len(presenters),

        "total_participants": (
            len(attendees) + len(presenters)
        ),
    }

@router.get(
    "/",
    response_model=list[ConferenceResponse],
)
def get_conferences(
    db: Session = Depends(get_db),
):
    return ConferenceService.get_all_conferences(db)


# ==========================================
# Registered Conferences
# ==========================================

@router.get(
    "/joined",
    response_model=list[ConferenceResponse],
)
def get_joined_conferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceRegistrationService.get_joined_conferences(
        db=db,
        current_user=current_user,
    )


# ==========================================
# Upcoming Conferences
# ==========================================

@router.get(
    "/upcoming",
    response_model=list[ConferenceResponse],
)
def get_upcoming_conferences(
    db: Session = Depends(get_db),
):
    return ConferenceService.get_upcoming_conferences(db)


# ==========================================
# Past Conferences
# ==========================================

@router.get(
    "/past",
    response_model=list[ConferenceResponse],
)
def get_past_conferences(
    db: Session = Depends(get_db),
):
    return ConferenceService.get_past_conferences(db)


# ==========================================
# Conference Registration
# ==========================================

@router.post(
    "/{conference_id}/join",
    response_model=ConferenceRegistrationResponse,
)
def join_conference(
    conference_id: UUID,
    data: ConferenceRegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceRegistrationService.join_conference(
        db=db,
        conference_id=conference_id,
        current_user=current_user,
        participation_type=data.participation_type,
    )


@router.delete(
    "/{conference_id}/leave",
)
def leave_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceRegistrationService.leave_conference(
        db=db,
        conference_id=conference_id,
        current_user=current_user,
    )


# ==========================================
# Individual Conference
# ==========================================

@router.get(
    "/{conference_id}",
    response_model=ConferenceResponse,
)
def get_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
):
    return ConferenceService.get_conference(
        db=db,
        conference_id=conference_id,
    )


@router.put(
    "/{conference_id}",
    response_model=ConferenceResponse,
)
def update_conference(
    conference_id: UUID,
    conference: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceService.update_conference(
        db=db,
        conference_id=conference_id,
        data=conference,
        current_user=current_user,
    )


@router.delete(
    "/{conference_id}",
)
def delete_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceService.delete_conference(
        db=db,
        conference_id=conference_id,
        current_user=current_user,
    )

@router.get(
    "/{conference_id}/details",
    response_model=ConferenceDetailsResponse,
)
def get_conference_details(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ConferenceService.get_conference_details(
        db=db,
        conference_id=conference_id,
        current_user=current_user,
    )
@router.post(
    "/{conference_id}/registrations/"
    "{registration_id}/approve-presenter",
    response_model=ConferenceRegistrationResponse,
)
def approve_presenter(
    conference_id: UUID,
    registration_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        ConferenceRegistrationService
        .approve_presenter(
            db=db,
            conference_id=conference_id,
            registration_id=registration_id,
            current_user=current_user,
        )
    )


@router.post(
    "/{conference_id}/registrations/"
    "{registration_id}/reject-presenter",
    response_model=ConferenceRegistrationResponse,
)
def reject_presenter(
    conference_id: UUID,
    registration_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        ConferenceRegistrationService
        .reject_presenter(
            db=db,
            conference_id=conference_id,
            registration_id=registration_id,
            current_user=current_user,
        )
    )
@router.on_event("startup")
async def start_conference_notifications():
    start_conference_notification_scheduler()