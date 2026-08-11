from uuid import UUID
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.publication import (
    Publication,
    PublicationStatus,
)
from app.models.user import User


class ReviewerService:

    @staticmethod
    def get_publications(
        db: Session,
        filter_status: str | None = None,
    ):

        query = db.query(Publication)

        if filter_status:
            try:
                status_value = PublicationStatus(
                    filter_status
                )
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid publication status"
                )

            query = query.filter(
                Publication.status == status_value
            )
        else:
            query = query.filter(
                Publication.status.in_([
                    PublicationStatus.SUBMITTED,
                    PublicationStatus.ACCEPTED,
                    PublicationStatus.REJECTED,
                ])
            )

        return (
            query
            .order_by(
                Publication.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def accept_publication(
        db: Session,
        publication_id: UUID,
        reviewer: User,
    ):

        publication = (
            db.query(Publication)
            .filter(
                Publication.id == publication_id
            )
            .first()
        )

        if not publication:
            raise HTTPException(
                status_code=404,
                detail="Publication not found"
            )

        if publication.status != PublicationStatus.SUBMITTED:
            raise HTTPException(
                status_code=400,
                detail="Only submitted publications can be accepted"
            )

        publication.status = PublicationStatus.ACCEPTED
        publication.reviewed_by = reviewer.id
        publication.reviewed_at = datetime.utcnow()
        publication.reviewer_comment = (
            "Publication accepted by reviewer."
        )

        db.commit()
        db.refresh(publication)

        return publication

    @staticmethod
    def reject_publication(
        db: Session,
        publication_id: UUID,
        reviewer: User,
        comment: str | None = None,
    ):

        publication = (
            db.query(Publication)
            .filter(
                Publication.id == publication_id
            )
            .first()
        )

        if not publication:
            raise HTTPException(
                status_code=404,
                detail="Publication not found"
            )

        if publication.status != PublicationStatus.SUBMITTED:
            raise HTTPException(
                status_code=400,
                detail="Only submitted publications can be rejected"
            )

        publication.status = PublicationStatus.REJECTED
        publication.reviewed_by = reviewer.id
        publication.reviewed_at = datetime.utcnow()
        publication.reviewer_comment = (
            comment or "Publication rejected by reviewer."
        )

        db.commit()
        db.refresh(publication)

        return publication