from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conference_registration import ConferenceRegistration


class ConferenceRegistrationRepository:

    @staticmethod
    def create(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
        participation_type: str,
    ):
        registration = ConferenceRegistration(
            conference_id=conference_id,
            user_id=user_id,
            participation_type=participation_type,
        )

        db.add(registration)
        db.commit()
        db.refresh(registration)

        return registration

    @staticmethod
    def get_registration(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
    ):
        return (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id == conference_id,
                ConferenceRegistration.user_id == user_id,
            )
            .first()
        )

    @staticmethod
    def delete(
        db: Session,
        registration: ConferenceRegistration,
    ):
        db.delete(registration)
        db.commit()

    @staticmethod
    def get_user_registrations(
        db: Session,
        user_id: UUID,
    ):
        return (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.user_id == user_id
            )
            .all()
        )

    @staticmethod
    def count_participants(
        db: Session,
        conference_id: UUID,
    ):
        return (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id == conference_id
            )
            .count()
        )

    @staticmethod
    def get_presenters(
        db: Session,
        conference_id: UUID,
    ):
        return (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id == conference_id,
                ConferenceRegistration.participation_type == "Presenter",
            )
            .all()
        )

    @staticmethod
    def is_registered(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
    ):
        return (
            db.query(ConferenceRegistration)
            .filter(
                ConferenceRegistration.conference_id == conference_id,
                ConferenceRegistration.user_id == user_id,
            )
            .first()
            is not None
        )