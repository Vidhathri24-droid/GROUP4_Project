from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import UserRole
from app.models.publication import Publication

from app.schemas.citation import (
    CitationCreate,
    CitationUpdate,
    CitationResponse,
)

from app.services.citation_service import CitationService


router = APIRouter(
    prefix="/citations",
    tags=["Citations"],
)


# ============================================================
# AUTHORIZATION HELPER
# ============================================================

def can_manage_publication(
    current_user,
    publication,
):
    """
    System Admin:
        Can manage citations for any publication.

    Researcher:
        Can manage citations only for publications
        owned by that researcher.

    Other roles:
        Not allowed.
    """

    if current_user.role == UserRole.SYSTEM_ADMIN:
        return True

    if current_user.role == UserRole.RESEARCHER:
        return publication.owner_id == current_user.id

    return False


# ============================================================
# CREATE CITATION
# ============================================================

@router.post(
    "/",
    response_model=CitationResponse,
    status_code=201,
)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == citation.publication_id
        )
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication not found.",
        )

    if not can_manage_publication(
        current_user,
        publication,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to add a citation "
                "for this publication. Only the researcher "
                "who owns the publication or a System Admin "
                "can add citations."
            ),
        )

    return CitationService.create_citation(
        db,
        citation,
    )


# ============================================================
# GET ALL CITATIONS
# ============================================================

@router.get(
    "/",
    response_model=list[CitationResponse],
)
def get_citations(
    mine: bool = Query(
        False,
        description="Return only citations belonging to publications owned by the current researcher.",
    ),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return CitationService.get_all_citations(
        db,
        current_user=current_user,
        mine=mine,
    )


# ============================================================
# GET ONE CITATION
# ============================================================

@router.get(
    "/{citation_id}",
    response_model=CitationResponse,
)
def get_citation(
    citation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    citation = CitationService.get_citation(
        db,
        citation_id,
    )

    if citation is None:
        raise HTTPException(
            status_code=404,
            detail="Citation not found.",
        )

    return citation


# ============================================================
# UPDATE CITATION
# ============================================================

@router.put(
    "/{citation_id}",
    response_model=CitationResponse,
)
def update_citation(
    citation_id: UUID,
    citation: CitationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    existing_citation = CitationService.get_citation(
        db,
        citation_id,
    )

    if existing_citation is None:
        raise HTTPException(
            status_code=404,
            detail="Citation not found.",
        )

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == existing_citation.publication_id
        )
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication associated with citation not found.",
        )

    if not can_manage_publication(
        current_user,
        publication,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to edit this citation. "
                "Only the researcher who owns the publication "
                "or a System Admin can edit it."
            ),
        )

    # --------------------------------------------------------
    # Prevent changing citation to another publication
    # --------------------------------------------------------

    if (
        hasattr(citation, "publication_id")
        and citation.publication_id is not None
        and citation.publication_id != existing_citation.publication_id
    ):

        new_publication = (
            db.query(Publication)
            .filter(
                Publication.id == citation.publication_id
            )
            .first()
        )

        if new_publication is None:
            raise HTTPException(
                status_code=404,
                detail="New publication not found.",
            )

        if not can_manage_publication(
            current_user,
            new_publication,
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not authorized to move this citation "
                    "to the selected publication."
                ),
            )

    return CitationService.update_citation(
        db,
        citation_id,
        citation,
    )


# ============================================================
# DELETE CITATION
# ============================================================

@router.delete(
    "/{citation_id}",
)
def delete_citation(
    citation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    citation = CitationService.get_citation(
        db,
        citation_id,
    )

    if citation is None:
        raise HTTPException(
            status_code=404,
            detail="Citation not found.",
        )

    publication = (
        db.query(Publication)
        .filter(
            Publication.id == citation.publication_id
        )
        .first()
    )

    if publication is None:
        raise HTTPException(
            status_code=404,
            detail="Publication associated with citation not found.",
        )

    if not can_manage_publication(
        current_user,
        publication,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to delete this citation. "
                "Only the researcher who owns the publication "
                "or a System Admin can delete it."
            ),
        )

    return CitationService.delete_citation(
        db,
        citation_id,
    )