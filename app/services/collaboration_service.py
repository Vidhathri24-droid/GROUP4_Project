from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.collaboration import Collaboration

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

        return CollaborationRepository.create(
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
