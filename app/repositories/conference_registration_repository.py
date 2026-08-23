from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conference_registration import (
    ConferenceRegistration,
)


class ConferenceRegistrationRepository:

    # =========================================================
    # CREATE
    # =========================================================

    @staticmethod
    def create(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
        participation_type: str,
        registration_status: str | None = None,
    ):
        """
        Create a conference registration.

        Attendee:
            Approved automatically.

        Presenter:
            Pending until Institution Admin approval.
        """

        registration = ConferenceRegistration(
            conference_id=conference_id,
            user_id=user_id,
            participation_type=participation_type,
        )

        # -----------------------------------------------------
        # Explicit registration status
        # -----------------------------------------------------

        if registration_status is not None:
            registration.status = registration_status

        db.add(registration)

        db.commit()

        db.refresh(registration)

        return registration

    # =========================================================
    # GET REGISTRATION
    # =========================================================

    @staticmethod
    def get_registration(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.conference_id
                == conference_id,
                ConferenceRegistration.user_id
                == user_id,
            )
            .first()
        )

    # =========================================================
    # GET BY ID
    # =========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        registration_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.id
                == registration_id
            )
            .first()
        )

    # =========================================================
    # DELETE
    # =========================================================

    @staticmethod
    def delete(
        db: Session,
        registration: ConferenceRegistration,
    ):
        db.delete(registration)

        db.commit()

    # =========================================================
    # GET USER REGISTRATIONS
    # =========================================================

    @staticmethod
    def get_user_registrations(
        db: Session,
        user_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.user_id
                == user_id
            )
            .all()
        )

    # =========================================================
    # COUNT PARTICIPANTS
    # =========================================================

    @staticmethod
    def count_participants(
        db: Session,
        conference_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.conference_id
                == conference_id
            )
            .count()
        )

    # =========================================================
    # GET PRESENTERS
    # =========================================================

    @staticmethod
    def get_presenters(
        db: Session,
        conference_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.conference_id
                == conference_id,
                ConferenceRegistration.participation_type
                == "Presenter",
            )
            .all()
        )

    # =========================================================
    # CHECK REGISTRATION
    # =========================================================

    @staticmethod
    def is_registered(
        db: Session,
        conference_id: UUID,
        user_id: UUID,
    ):
        return (
            db.query(
                ConferenceRegistration
            )
            .filter(
                ConferenceRegistration.conference_id
                == conference_id,
                ConferenceRegistration.user_id
                == user_id,
            )
            .first()
            is not None
        )