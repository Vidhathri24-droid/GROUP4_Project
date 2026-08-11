from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.models.conference_registration import ConferenceRegistration

from app.repositories.conference_registration_repository import (
    ConferenceRegistrationRepository,
)

from app.services.conference_service import ConferenceService


class ConferenceRegistrationService:

    @staticmethod
    def join_conference(
        db: Session,
        conference_id: UUID,
        current_user: User,
        participation_type: str,
    ):

        if current_user.role != UserRole.RESEARCHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only researchers can join conferences.",
            )

        ConferenceService.get_conference(
            db=db,
            conference_id=conference_id,
        )

        existing = (
            ConferenceRegistrationRepository.get_registration(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
            )
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already joined this conference.",
            )

        return ConferenceRegistrationRepository.create(
            db=db,
            conference_id=conference_id,
            user_id=current_user.id,
            participation_type=participation_type,
        )

    @staticmethod
    def leave_conference(
        db: Session,
        conference_id: UUID,
        current_user: User,
    ):

        if current_user.role != UserRole.RESEARCHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only researchers can leave conferences.",
            )

        registration = (
            ConferenceRegistrationRepository.get_registration(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
            )
        )

        if registration is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You are not registered for this conference.",
            )

        ConferenceRegistrationRepository.delete(
            db=db,
            registration=registration,
        )

        return {
            "message": "Successfully left the conference."
        }

    @staticmethod
    def get_joined_conferences(
        db: Session,
        current_user: User,
    ):

        if current_user.role != UserRole.RESEARCHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only researchers can view joined conferences.",
            )

        registrations = (
            ConferenceRegistrationRepository
            .get_user_registrations(
                db=db,
                user_id=current_user.id,
            )
        )

        conferences = [
            registration.conference
            for registration in registrations
        ]

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

    @staticmethod
    def participant_count(
        db: Session,
        conference_id: UUID,
    ):

        return (
            ConferenceRegistrationRepository
            .count_participants(
                db=db,
                conference_id=conference_id,
            )
        )