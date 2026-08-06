<<<<<<< HEAD
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.collaboration import Collaboration

=======
from sqlalchemy.orm import Session
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType
from app.repositories.user_repository import UserRepository

from app.models.collaboration import (
    Collaboration,
    CollaborationStatus,
)
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)

<<<<<<< HEAD
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

=======
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab

class CollaborationService:

    @staticmethod
<<<<<<< HEAD
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

        return CollaborationRepository.create(
=======
    def send_request(
        db: Session,
        sender_id,
        receiver_id,
    ):
        collaboration = Collaboration(
            sender_id=sender_id,
            receiver_id=receiver_id,
            status=CollaborationStatus.PENDING,
        )

        collaboration = CollaborationRepository.create(
            db,
            collaboration,
        )

        sender = UserRepository.get_by_id(db, sender_id)

        NotificationService.create_notification(
            db=db,
            user_id=receiver_id,
            title="New Collaboration Request",
            message=f"{sender.email} sent you a collaboration request.",
            notification_type=NotificationType.COLLABORATION,
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
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
            db,
            collaboration,
        )

    @staticmethod
    def get_all(db: Session):
<<<<<<< HEAD
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
=======
        return CollaborationRepository.get_all(db)
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
