from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User, UserRole
from app.models.publication import (
    Publication,
    PublicationStatus,
)
from app.schemas.publication import PublicationResponse


router = APIRouter(
    prefix="/reviewer",
    tags=["Reviewer"],
)


def require_reviewer(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.REVIEWER:
        raise HTTPException(
            status_code=403,
            detail="Reviewer access required",
        )

    return current_user


# --------------------------------------------------
# GET PUBLICATIONS FOR REVIEW
# --------------------------------------------------

@router.get(
    "/publications",
    response_model=list[PublicationResponse],
)
def get_reviewer_publications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_reviewer),
):
    publications = (
        db.query(Publication)
        .order_by(
            Publication.created_at.desc()
        )
        .all()
    )

    return publications


# --------------------------------------------------
# ACCEPT PUBLICATION
# --------------------------------------------------

@router.patch(
    "/publications/{publication_id}/accept",
    response_model=PublicationResponse,
)
def accept_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_reviewer),
):
    publication = (
        db.query(Publication)
        .filter(
            Publication.id == publication_id
        )
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found",
        )

    if publication.status != PublicationStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Only submitted publications can be accepted",
        )

    publication.status = PublicationStatus.ACCEPTED
    publication.reviewed_by = current_user.id
    publication.reviewed_at = datetime.utcnow()
    publication.reviewer_comment = "Publication accepted"

    db.commit()
    db.refresh(publication)

    return publication


# --------------------------------------------------
# REJECT PUBLICATION
# --------------------------------------------------

@router.patch(
    "/publications/{publication_id}/reject",
    response_model=PublicationResponse,
)
def reject_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_reviewer),
):
    publication = (
        db.query(Publication)
        .filter(
            Publication.id == publication_id
        )
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found",
        )

    if publication.status != PublicationStatus.SUBMITTED:
        raise HTTPException(
            status_code=400,
            detail="Only submitted publications can be rejected",
        )

    publication.status = PublicationStatus.REJECTED
    publication.reviewed_by = current_user.id
    publication.reviewed_at = datetime.utcnow()
    publication.reviewer_comment = "Publication rejected"

    db.commit()
    db.refresh(publication)

    return publication