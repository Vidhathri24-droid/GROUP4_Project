from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.researcher import Researcher
from app.services.notification_service import NotificationService
from app.repositories.user_repository import UserRepository
from app.models.researcher import Researcher
from app.models.collaboration import (
    Collaboration,
    CollaborationStatus,
)
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)

from app.repositories.researcher_repository import (
    ResearcherRepository,
)

from app.repositories.publication_repository import (
    PublicationRepository,
)

from app.schemas.collaboration import (
    CollaborationCreate,
    CollaborationUpdate,
)


class CollaborationService:

    @staticmethod
    def create(
        db: Session,
        data: CollaborationCreate,
    ):

        researcher1 = ResearcherRepository.get_by_id(
            db,
            data.researcher1_id,
        )

        researcher2 = ResearcherRepository.get_by_id(
            db,
            data.researcher2_id,
        )

        if researcher1 is None or researcher2 is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Researcher not found",
            )

        if data.publication_id:

            publication = PublicationRepository.get_by_id(
                db,
                data.publication_id,
            )

            if publication is None:
                raise HTTPException(
                    status_code=404,
                    detail="Publication not found",
                )

        collaboration = Collaboration(
            researcher1_id=data.researcher1_id,
            researcher2_id=data.researcher2_id,
            publication_id=data.publication_id,
            collaboration_type=data.collaboration_type,
            status=data.status,
            description=data.description,
        )

        return CollaborationRepository.create
        (
            db,
            collaboration,
        )

    @staticmethod
    def send_request(
        db: Session,
        sender_id: UUID,
        receiver_id: UUID,
        publication_id: UUID | None,
        collaboration_type,
        description: str | None = None,
    ):
        # receiver_id coming from frontend is Researcher.id
        receiver = (
            db.query(Researcher)
            .filter(
                Researcher.id == receiver_id
            )
            .first()
        )

        if receiver is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver researcher not found.",
            )

        # Convert Researcher.id -> User.id
        receiver_user_id = receiver.user_id

        # Prevent sending request to yourself
        if sender_id == receiver_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "You cannot send a collaboration "
                    "request to yourself."
                ),
            )

        collaboration = Collaboration(
            sender_id=sender_id,
            receiver_id=receiver_user_id,
            publication_id=publication_id,
            collaboration_type=collaboration_type,
            description=description,
            status="PENDING",
        )

        collaboration = CollaborationRepository.create(
            db,
            collaboration,
        )

        # ========================================================
        # CREATE NOTIFICATION
        # ========================================================

        sender_researcher = (
            db.query(Researcher)
            .filter(
                Researcher.user_id == sender_id
            )
            .first()
        )

        if sender_researcher:
            sender_name = (
                f"{sender_researcher.first_name or ''} "
                f"{sender_researcher.last_name or ''}"
            ).strip()
        else:
            sender_name = "A researcher"

        NotificationService.create_notification(
            db=db,
            user_id=receiver_user_id,
            title="New Collaboration Request",
            message=(
                f"{sender_name} sent you a "
                "collaboration request."
            ),
            notification_type="COLLABORATION_REQUEST",
            reference_id=collaboration.id,
        )

        return collaboration

    @staticmethod
    def get_pending_requests(
        db: Session,
        receiver_id,
    ):
        return CollaborationRepository.get_pending_requests(
            db,
            receiver_id,
        )

    @staticmethod
    def accept_request(
        db: Session,
        collaboration,
    ):
        collaboration.status = CollaborationStatus.ACCEPTED
        return CollaborationRepository.update(
            db,
            collaboration,
        )

    @staticmethod
    def reject_request(
        db: Session,
        collaboration,
    ):
        collaboration.status = CollaborationStatus.REJECTED
        return CollaborationRepository.update(
            db,
            collaboration,
        )

    @staticmethod
    def get_all(db: Session):
        return CollaborationRepository.get_all(db)

    @staticmethod
    def get(
        db: Session,
        collaboration_id: UUID,
    ):

        collaboration = (
            CollaborationRepository.get_by_id(
                db,
                collaboration_id,
            )
        )

        if collaboration is None:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        return collaboration

    @staticmethod
    def update(
        db: Session,
        collaboration_id: UUID,
        data: CollaborationUpdate,
    ):

        collaboration = (
            CollaborationRepository.get_by_id(
                db,
                collaboration_id,
            )
        )

        if collaboration is None:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        if data.collaboration_type is not None:
            collaboration.collaboration_type = (
                data.collaboration_type
            )

        if data.status is not None:
            collaboration.status = data.status

        if data.description is not None:
            collaboration.description = data.description

        if data.publication_id is not None:
            collaboration.publication_id = (
                data.publication_id
            )

        db.commit()
        db.refresh(collaboration)

        return collaboration

    @staticmethod
    def delete(
        db: Session,
        collaboration_id: UUID,
    ):

        collaboration = (
            CollaborationRepository.get_by_id(
                db,
                collaboration_id,
            )
        )

        if collaboration is None:
            raise HTTPException(
                status_code=404,
                detail="Collaboration not found",
            )

        CollaborationRepository.delete(
            db,
            collaboration,
        )

        return {
            "message": "Collaboration deleted successfully"
        }

    @staticmethod
    def get_sent_pending_requests(
        db: Session,
        current_user_id: UUID,
    ):
        collaborations = (
            db.query(Collaboration)
            .filter(
                Collaboration.sender_id == current_user_id,
                Collaboration.status == CollaborationStatus.PENDING,
            )
            .all()
        )

        return [
            CollaborationService._format_collaboration(db, collaboration)
            for collaboration in collaborations
        ]

    @staticmethod
    def get_received_pending_requests(
        db: Session,
        current_user_id: UUID,
    ):
        collaborations = (
            db.query(Collaboration)
            .filter(
                Collaboration.receiver_id == current_user_id,
                Collaboration.status == CollaborationStatus.PENDING,
            )
            .all()
        )

        return [
            CollaborationService._format_collaboration(db, collaboration)
            for collaboration in collaborations
        ]

    @staticmethod
    def get_accepted_collaborations(
        db: Session,
        current_user_id: UUID,
    ):
        collaborations = (
            db.query(Collaboration)
            .filter(
                Collaboration.status == CollaborationStatus.ACCEPTED,
                (
                    (Collaboration.sender_id == current_user_id)
                    |
                    (Collaboration.receiver_id == current_user_id)
                ),
            )
            .all()
        )

        return [
            CollaborationService._format_collaboration(db, collaboration)
            for collaboration in collaborations
        ]
    
    @staticmethod
    def _format_collaboration(db: Session, collaboration):
        sender = (
            db.query(Researcher)
            .filter(Researcher.user_id == collaboration.sender_id)
            .first()
        )

        receiver = (
            db.query(Researcher)
            .filter(Researcher.user_id == collaboration.receiver_id)
            .first()
        )

        return {
            "id": collaboration.id,
            "sender_id": collaboration.sender_id,
            "receiver_id": collaboration.receiver_id,

            "sender_name": (
                f"{sender.first_name} {sender.last_name}"
                if sender
                else "Unknown Researcher"
            ),

            "receiver_name": (
                f"{receiver.first_name} {receiver.last_name}"
                if receiver
                else "Unknown Researcher"
            ),

            "publication_id": collaboration.publication_id,
            "collaboration_type": collaboration.collaboration_type,
            "description": collaboration.description,
            "status": collaboration.status,
            "created_at": collaboration.created_at,
        }