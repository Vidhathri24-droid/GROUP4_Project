from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
)

from app.models.user import User

from app.schemas.citation import (
    CitationCreate,
    CitationUpdate,
    CitationResponse,
)

from app.services.citation_service import CitationService
from fastapi.responses import PlainTextResponse

router = APIRouter(
    prefix="/citations",
    tags=["Citations"],
)


@router.post(
    "/",
    response_model=CitationResponse,
    status_code=201,
)
def create_citation(
    citation: CitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CitationService.create_citation(
        db=db,
        data=citation,
    )


@router.get(
    "/",
    response_model=list[CitationResponse],
)
def get_citations(
    db: Session = Depends(get_db),
):
    return CitationService.get_all(db)


@router.get(
    "/{citation_id}",
    response_model=CitationResponse,
)
def get_citation(
    citation_id: UUID,
    db: Session = Depends(get_db),
):
    return CitationService.get(
        db=db,
        citation_id=citation_id,
    )


@router.get(
    "/publication/{publication_id}",
    response_model=list[CitationResponse],
)
def get_publication_citations(
    publication_id: UUID,
    db: Session = Depends(get_db),
):
    return CitationService.get_by_publication(
        db=db,
        publication_id=publication_id,
    )


@router.put(
    "/{citation_id}",
    response_model=CitationResponse,
)
def update_citation(
    citation_id: UUID,
    citation: CitationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CitationService.update(
        db=db,
        citation_id=citation_id,
        data=citation,
    )


@router.delete(
    "/{citation_id}",
)
def delete_citation(
    citation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CitationService.delete(
        db=db,
        citation_id=citation_id,
    )

@router.get(
    "/{citation_id}/bibtex",
    response_class=PlainTextResponse,
)
def export_bibtex(
    citation_id: UUID,
    db: Session = Depends(get_db),
):

    return CitationService.export_bibtex(
        db=db,
        citation_id=citation_id,
    )
