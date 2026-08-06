from uuid import UUID
<<<<<<< HEAD

from sqlalchemy.orm import Session

from app.models.collaboration import Collaboration
=======
from sqlalchemy.orm import Session

from app.models.collaboration import Collaboration, CollaborationStatus
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab


class CollaborationRepository:

    @staticmethod
    def create(db: Session, collaboration: Collaboration):
        db.add(collaboration)
        db.commit()
        db.refresh(collaboration)
        return collaboration

    @staticmethod
<<<<<<< HEAD
    def get_all(db: Session):
        return (
            db.query(Collaboration)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        collaboration_id: UUID,
    ):
        return (
            db.query(Collaboration)
            .filter(
                Collaboration.id == collaboration_id
            )
=======
    def get_by_id(db: Session, collaboration_id: UUID):
        return (
            db.query(Collaboration)
            .filter(Collaboration.id == collaboration_id)
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
            .first()
        )

    @staticmethod
<<<<<<< HEAD
    def delete(
        db: Session,
        collaboration: Collaboration,
    ):
        db.delete(collaboration)
        db.commit()

    @staticmethod
    def get_active_count(db: Session):
        return (
            db.query(Collaboration)
            .filter(
                Collaboration.status == CollaborationStatus.ACTIVE
            )
            .count()
        )


    @staticmethod
    def get_pending_count(db: Session):
        return (
            db.query(Collaboration)
            .filter(
                Collaboration.status == CollaborationStatus.PENDING
            )
            .count()
        )


    @staticmethod
    def get_recent(db: Session, limit=5):
        return (
            db.query(Collaboration)
            .order_by(Collaboration.created_at.desc())
            .limit(limit)
            .all()
        )
=======
    def get_pending_requests(db: Session, receiver_id: UUID):
        return (
            db.query(Collaboration)
            .filter(
                Collaboration.receiver_id == receiver_id,
                Collaboration.status == CollaborationStatus.PENDING,
            )
            .all()
        )

    @staticmethod
    def get_all(db: Session):
        return db.query(Collaboration).all()

    @staticmethod
    def update(db: Session, collaboration: Collaboration):
        db.commit()
        db.refresh(collaboration)
        return collaboration

    @staticmethod
    def delete(db: Session, collaboration: Collaboration):
        db.delete(collaboration)
        db.commit()
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
