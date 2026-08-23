from uuid import UUID

from fastapi import (
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.models.user import (
    User,
    UserRole,
)

from app.models.conference_registration import (
    ParticipationType,
    RegistrationStatus,
    ConferenceRegistration,
)

from app.repositories.conference_registration_repository import (
    ConferenceRegistrationRepository,
)

from app.repositories.conference_repository import (
    ConferenceRepository,
)

from app.services.conference_service import (
    ConferenceService,
)

from app.services.notification_service import (
    NotificationService,
)


class ConferenceRegistrationService:

    # =========================================================
    # JOIN CONFERENCE
    # =========================================================

    @staticmethod
    def join_conference(
        db: Session,
        conference_id: UUID,
        current_user: User,
        participation_type: str,
    ):
        # =========================================================
        # ONLY RESEARCHERS CAN JOIN
        # =========================================================

        if current_user.role != UserRole.RESEARCHER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only researchers can join conferences.",
            )

        print("\n========================================")
        print("CONFERENCE JOIN REQUEST")
        print("Conference ID:", conference_id)
        print("Researcher ID:", current_user.id)
        print("Researcher Email:", current_user.email)
        print("Raw participation type:", participation_type)
        print("Participation type:", getattr(
            participation_type,
            "value",
            participation_type
        ))
        print("========================================\n")

        # =========================================================
        # GET CONFERENCE
        # =========================================================

        conference = ConferenceService.get_conference(
            db=db,
            conference_id=conference_id,
        )

        if conference is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conference not found.",
            )

        print("Conference:", conference.title)
        print("Conference created_by:", conference.created_by)

        # =========================================================
        # NORMALIZE PARTICIPATION TYPE
        # =========================================================

        if hasattr(participation_type, "value"):
            participation_type = participation_type.value

        participation_type = str(participation_type)

        print(
            "Normalized participation type:",
            participation_type
        )

        # =========================================================
        # VALIDATE PARTICIPATION TYPE
        # =========================================================

        if participation_type not in (
            ParticipationType.ATTENDEE.value,
            ParticipationType.PRESENTER.value,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid participation type: "
                    f"{participation_type}"
                ),
            )

        # =========================================================
        # CHECK EXISTING REGISTRATION
        # =========================================================

        existing = (
            ConferenceRegistrationRepository
            .get_registration(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
            )
        )

        if existing:

            if (
                existing.status
                == RegistrationStatus.REJECTED.value
            ):
                ConferenceRegistrationRepository.delete(
                    db=db,
                    registration=existing,
                )

                print(
                    "Previous rejected registration "
                    "deleted. Allowing new request."
                )

            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "You have already joined this "
                        "conference or your registration "
                        "is pending."
                    ),
                )

        # =========================================================
        # DETERMINE REGISTRATION STATUS
        # =========================================================

        if (
            participation_type
            == ParticipationType.PRESENTER.value
        ):
            registration_status = (
                RegistrationStatus.PENDING.value
            )
        else:
            registration_status = (
                RegistrationStatus.APPROVED.value
            )

        print(
            "Registration status:",
            registration_status
        )

        # =========================================================
        # CREATE REGISTRATION
        # =========================================================

        registration = (
            ConferenceRegistrationRepository.create(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
                participation_type=participation_type,
                registration_status=registration_status,
            )
        )

        print(
            "Registration created:",
            registration.id
        )

        # =========================================================
        # PRESENTER REQUEST
        # =========================================================

        if (
            participation_type
            == ParticipationType.PRESENTER.value
        ):

            print("\n========================================")
            print("PRESENTER REQUEST DETECTED")
            print("========================================")

            # -----------------------------------------------------
            # FIND CONFERENCE ADMIN USING created_by
            # -----------------------------------------------------

            if not conference.created_by:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "This conference does not have "
                        "an institution administrator assigned."
                    ),
                )

            admin = (
                db.query(User)
                .filter(
                    User.id == conference.created_by
                )
                .first()
            )

            print("Admin found:", admin)

            if admin is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "The institution administrator "
                        "who created this conference "
                        "could not be found."
                    ),
                )

            print("Admin ID:", admin.id)
            print("Admin Email:", admin.email)
            print("Admin Role:", admin.role)

            # -----------------------------------------------------
            # VERIFY ADMIN ROLE
            # -----------------------------------------------------

            if admin.role not in (
                UserRole.INSTITUTION_ADMIN,
                UserRole.SYSTEM_ADMIN,
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "The creator of this conference "
                        "is not an institution administrator."
                    ),
                )

            # -----------------------------------------------------
            # GET RESEARCHER NAME
            # -----------------------------------------------------

            researcher_name = current_user.email

            if current_user.researcher:

                first_name = (
                    current_user.researcher.first_name
                    or ""
                )

                last_name = (
                    current_user.researcher.last_name
                    or ""
                )

                full_name = (
                    f"{first_name} {last_name}"
                ).strip()

                if full_name:
                    researcher_name = full_name

            # -----------------------------------------------------
            # CREATE NOTIFICATION
            # -----------------------------------------------------

            title = "Presenter Approval Required"

            message = (
                f'{researcher_name} has requested '
                f'to participate as a presenter '
                f'for "{conference.title}". '
                f'Please review and approve or '
                f'reject the request.'
            )

            print("\n========================================")
            print("CREATING PRESENTER NOTIFICATION")
            print("Target Admin ID:", admin.id)
            print("Target Admin Email:", admin.email)
            print("Title:", title)
            print("Message:", message)
            print("Conference ID:", conference.id)
            print("========================================\n")

            try:

                notification = (
                    NotificationService.create_notification(
                        db=db,
                        user_id=admin.id,
                        title=title,
                        message=message,
                        notification_type=(
                            "PRESENTER_REQUEST"
                        ),
                        reference_id=conference.id,
                        email=admin.email,
                        send_email=True,
                    )
                )

                print("\n========================================")
                print("PRESENTER NOTIFICATION CREATED")
                print(
                    "Notification ID:",
                    notification.id
                )
                print(
                    "Notification User ID:",
                    notification.user_id
                )
                print(
                    "Notification Type:",
                    notification.notification_type
                )
                print("========================================\n")

            except Exception as exc:

                print("\n========================================")
                print("PRESENTER NOTIFICATION FAILED")
                print("ERROR:", repr(exc))
                print("========================================\n")

                # Roll back only the notification transaction.
                db.rollback()

                # Do NOT silently make the request look successful.
                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Presenter registration was created, "
                        "but the administrator notification "
                        f"could not be created: {str(exc)}"
                    ),
                )

        # =========================================================
        # ATTENDEE
        # =========================================================

        else:

            print(
                "Normal attendee registration created."
            )

        # =========================================================
        # RETURN
        # =========================================================

        print("\n========================================")
        print("CONFERENCE JOIN SUCCESS")
        print("Registration ID:", registration.id)
        print("Participation:", participation_type)
        print("Status:", registration.status)
        print("========================================\n")

        return registration

    # =========================================================
    # APPROVE PRESENTER
    # =========================================================

    @staticmethod
    def approve_presenter(
        db: Session,
        conference_id: UUID,
        registration_id: UUID,
        current_user: User,
    ):

        conference = (
            ConferenceRepository.get_by_id(
                db,
                conference_id,
            )
        )

        if conference is None:

            raise HTTPException(
                status_code=404,
                detail="Conference not found.",
            )

        # -----------------------------------------------------
        # Only conference creator
        # -----------------------------------------------------

        if (
            conference.created_by
            != current_user.id
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "Only the administrator who "
                    "created this conference can "
                    "approve presenter requests."
                ),
            )

        # -----------------------------------------------------
        # Role
        # -----------------------------------------------------

        if current_user.role not in (
            UserRole.INSTITUTION_ADMIN,
            UserRole.SYSTEM_ADMIN,
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "Administrator access required."
                ),
            )

        # -----------------------------------------------------
        # Registration
        # -----------------------------------------------------

        registration = (
            ConferenceRegistrationRepository
            .get_by_id(
                db,
                registration_id,
            )
        )

        if registration is None:

            raise HTTPException(
                status_code=404,
                detail="Registration not found.",
            )

        # -----------------------------------------------------
        # Verify conference
        # -----------------------------------------------------

        if (
            registration.conference_id
            != conference_id
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Registration does not belong "
                    "to this conference."
                ),
            )

        # -----------------------------------------------------
        # Presenter only
        # -----------------------------------------------------

        if (
            registration.participation_type
            != ParticipationType.PRESENTER.value
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only presenter requests "
                    "can be approved."
                ),
            )

        # -----------------------------------------------------
        # Pending only
        # -----------------------------------------------------

        if (
            registration.status
            != RegistrationStatus.PENDING.value
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "This presenter request "
                    "has already been processed."
                ),
            )

        # -----------------------------------------------------
        # Approve
        # -----------------------------------------------------

        registration.status = (
            RegistrationStatus.APPROVED.value
        )

        db.commit()
        db.refresh(registration)

        # -----------------------------------------------------
        # Researcher
        # -----------------------------------------------------

        researcher = registration.user

        if researcher is None:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Researcher associated with "
                    "this registration could not "
                    "be found."
                ),
            )

        # -----------------------------------------------------
        # Notify researcher
        # -----------------------------------------------------

        NotificationService.create_notification(
            db=db,
            user_id=researcher.id,
            title=(
                "Presenter Request Accepted"
            ),
            message=(
                f'Your request to participate '
                f'as a presenter for '
                f'"{conference.title}" has been '
                f'accepted by the institution '
                f'administrator.'
            ),
            notification_type=(
                "PRESENTER_APPROVED"
            ),
            reference_id=conference.id,
            email=researcher.email,
            send_email=True,
        )

        return registration

    # =========================================================
    # REJECT PRESENTER
    # =========================================================

    @staticmethod
    def reject_presenter(
        db: Session,
        conference_id: UUID,
        registration_id: UUID,
        current_user: User,
    ):

        conference = (
            ConferenceRepository.get_by_id(
                db,
                conference_id,
            )
        )

        if conference is None:

            raise HTTPException(
                status_code=404,
                detail="Conference not found.",
            )

        # -----------------------------------------------------
        # Only conference creator
        # -----------------------------------------------------

        if (
            conference.created_by
            != current_user.id
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "Only the administrator who "
                    "created this conference can "
                    "reject presenter requests."
                ),
            )

        # -----------------------------------------------------
        # Role
        # -----------------------------------------------------

        if current_user.role not in (
            UserRole.INSTITUTION_ADMIN,
            UserRole.SYSTEM_ADMIN,
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "Administrator access required."
                ),
            )

        # -----------------------------------------------------
        # Registration
        # -----------------------------------------------------

        registration = (
            ConferenceRegistrationRepository
            .get_by_id(
                db,
                registration_id,
            )
        )

        if registration is None:

            raise HTTPException(
                status_code=404,
                detail="Registration not found.",
            )

        # -----------------------------------------------------
        # Verify conference
        # -----------------------------------------------------

        if (
            registration.conference_id
            != conference_id
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Registration does not belong "
                    "to this conference."
                ),
            )

        # -----------------------------------------------------
        # Presenter only
        # -----------------------------------------------------

        if (
            registration.participation_type
            != ParticipationType.PRESENTER.value
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Only presenter requests "
                    "can be rejected."
                ),
            )

        # -----------------------------------------------------
        # Pending only
        # -----------------------------------------------------

        if (
            registration.status
            != RegistrationStatus.PENDING.value
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "This presenter request "
                    "has already been processed."
                ),
            )

        # -----------------------------------------------------
        # Reject
        # -----------------------------------------------------

        registration.status = (
            RegistrationStatus.REJECTED.value
        )

        db.commit()
        db.refresh(registration)

        # -----------------------------------------------------
        # Researcher
        # -----------------------------------------------------

        researcher = registration.user

        if researcher is None:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Researcher associated with "
                    "this registration could not "
                    "be found."
                ),
            )

        # -----------------------------------------------------
        # Notify researcher
        # -----------------------------------------------------

        NotificationService.create_notification(
            db=db,
            user_id=researcher.id,
            title=(
                "Presenter Request Rejected"
            ),
            message=(
                f'Your request to participate '
                f'as a presenter for '
                f'"{conference.title}" was rejected '
                f'by the institution administrator.'
            ),
            notification_type=(
                "PRESENTER_REJECTED"
            ),
            reference_id=conference.id,
            email=researcher.email,
            send_email=True,
        )

        return registration

    # =========================================================
    # LEAVE CONFERENCE
    # =========================================================

    @staticmethod
    def leave_conference(
        db: Session,
        conference_id: UUID,
        current_user: User,
    ):

        if current_user.role != UserRole.RESEARCHER:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Only researchers can leave "
                    "conferences."
                ),
            )

        registration = (
            ConferenceRegistrationRepository
            .get_registration(
                db=db,
                conference_id=conference_id,
                user_id=current_user.id,
            )
        )

        if registration is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "You are not registered "
                    "for this conference."
                ),
            )

        ConferenceRegistrationRepository.delete(
            db=db,
            registration=registration,
        )

        return {
            "message": (
                "Successfully left the conference."
            )
        }

    # =========================================================
    # GET JOINED CONFERENCES
    # =========================================================

    @staticmethod
    def get_joined_conferences(
        db: Session,
        current_user: User,
    ):

        if current_user.role != UserRole.RESEARCHER:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Only researchers can view "
                    "joined conferences."
                ),
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
            if registration.status
            != RegistrationStatus.REJECTED.value
        ]

        for conference in conferences:

            conference.participant_count = (
                ConferenceRegistrationRepository
                .count_participants(
                    db=db,
                    conference_id=conference.id,
                )
            )

        return conferences

    # =========================================================
    # PARTICIPANT COUNT
    # =========================================================

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