from sqlalchemy.orm import Session

from app.models.collaboration import (
    Collaboration,
    CollaborationStatus,
)
from app.repositories.collaboration_repository import (
    CollaborationRepository,
)


class CollaborationService:

    @staticmethod
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

        return CollaborationRepository.create(
            db,
            collaboration,
        )

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