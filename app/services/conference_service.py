from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conference import Conference
from app.models.user import User, UserRole
from app.models.conference_registration import ConferenceRegistration

from app.repositories.conference_repository import ConferenceRepository

from app.schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
)

from app.repositories.conference_registration_repository import (
    ConferenceRegistrationRepository,
)

class ConferenceService:

    # =========================================================
    # Helper - add REAL participant count
    # =========================================================

    @staticmethod
    def _add_participant_counts(
        db: Session,
        conferences,
    ):
        for conference in conferences:

            conference.participant_count = (
                db.query(ConferenceRegistration)
                .filter(
                    ConferenceRegistration.conference_id
                    == conference.id
                )
                .count()
            )

        return conferences

    # =========================================================
    # CREATE
    # =========================================================

    @staticmethod
    def create_conference(
        db: Session,
        data: ConferenceCreate,
        current_user: User,
    ):

        if current_user.role not in [
            UserRole.SYSTEM_ADMIN,
            UserRole.INSTITUTION_ADMIN,
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only System Admin and Institution Admin can create conferences.",
            )

        existing = ConferenceRepository.get_by_title(
            db,
            data.title,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conference already exists",
            )

        conference = Conference(
            **data.model_dump()
        )

        return ConferenceRepository.create(
            db,
            conference,
        )

    # =========================================================
    # GET ALL
    # =========================================================

    @staticmethod
    def get_all_conferences(
        db: Session,
    ):

        conferences = ConferenceRepository.get_all(db)

        return ConferenceService._add_participant_counts(
            db,
            conferences,
        )

    # =========================================================
    # GET ONE
    # =========================================================

    @staticmethod
    def get_conference(
        db: Session,
        conference_id: UUID,
    ):

        conference = ConferenceRepository.get_by_id(
            db,
            conference_id,
        )

        if conference is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conference not found",
            )

        # REAL participant count
        conference.participant_count = (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id
                == conference.id
            )
            .count()
        )

        return conference

    # =========================================================
    # UPCOMING
    # =========================================================

    @staticmethod
    def get_upcoming_conferences(
        db: Session,
    ):

        conferences = (
            db.query(Conference)
            .filter(
                Conference.conference_date >= date.today()
            )
            .order_by(
                Conference.conference_date.asc()
            )
            .all()
        )

        return ConferenceService._add_participant_counts(
            db,
            conferences,
        )

    # =========================================================
    # PAST
    # =========================================================

    @staticmethod
    def get_past_conferences(
        db: Session,
    ):

        conferences = (
            db.query(Conference)
            .filter(
                Conference.conference_date < date.today()
            )
            .order_by(
                Conference.conference_date.desc()
            )
            .all()
        )

        return ConferenceService._add_participant_counts(
            db,
            conferences,
        )

    # =========================================================
    # UPDATE
    # =========================================================

    @staticmethod
    def update_conference(
        db: Session,
        conference_id: UUID,
        data: ConferenceUpdate,
        current_user: User,
    ):

        if current_user.role not in [
            UserRole.SYSTEM_ADMIN,
            UserRole.INSTITUTION_ADMIN,
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only System Admin and Institution Admin can update conferences.",
            )

        conference = ConferenceRepository.get_by_id(
            db,
            conference_id,
        )

        if conference is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conference not found",
            )

        updates = data.model_dump(
            exclude_unset=True
        )

        for key, value in updates.items():
            setattr(
                conference,
                key,
                value,
            )

        db.commit()
        db.refresh(conference)

        # Refresh participant count
        conference.participant_count = (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id
                == conference.id
            )
            .count()
        )

        return conference

    # =========================================================
    # DELETE
    # =========================================================

    @staticmethod
    def delete_conference(
        db: Session,
        conference_id: UUID,
        current_user: User,
    ):

        if current_user.role not in [
            UserRole.SYSTEM_ADMIN,
            UserRole.INSTITUTION_ADMIN,
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only System Admin and Institution Admin can delete conferences.",
            )

        conference = ConferenceRepository.get_by_id(
            db,
            conference_id,
        )

        if conference is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conference not found",
            )

        ConferenceRepository.delete(
            db,
            conference,
        )

        return {
            "message": "Conference deleted successfully"
        }

    #=======================================================#
    #CONFERENCE_DETAILS
    #==============================================================#
    @staticmethod
    def get_conference_details(
        db: Session,
        conference_id: UUID,
        current_user: User,
    ):
        conference = ConferenceRepository.get_by_id(
            db,
            conference_id,
        )

        if conference is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conference not found",
            )

        registrations = (
            ConferenceRegistrationRepository.get_presenters(
                db=db,
                conference_id=conference_id,
            )
        )

        presenters = []

        for registration in registrations:
            user = registration.user

            if user:
                name = getattr(user, "email", "Unknown")

                if hasattr(user, "researcher") and user.researcher:
                    researcher = user.researcher

                    first_name = researcher.first_name or ""
                    last_name = researcher.last_name or ""

                    full_name = f"{first_name} {last_name}".strip()

                    if full_name:
                        name = full_name

                presenters.append({
                    "id": user.id,
                    "name": name,
                })

        participant_count = (
            ConferenceRegistrationRepository.count_participants(
                db=db,
                conference_id=conference_id,
            )
        )

        is_registered = (
            ConferenceRegistrationRepository.is_registered(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
            )
        )

        return {
            "id": conference.id,
            "title": conference.title,
            "location": conference.location,
            "conference_date": conference.conference_date,
            "conference_time": conference.conference_time,
            "description": conference.description,
            "participant_count": participant_count,
            "is_registered": is_registered,
            "presenters": presenters,
        }