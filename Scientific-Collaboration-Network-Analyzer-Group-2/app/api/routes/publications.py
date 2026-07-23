from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    Query,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
)
from app.models.user import User
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
    PublicationResponse,
)
from app.services.publication_service import PublicationService

router = APIRouter(
    prefix="/publications",
    tags=["Publications"],
)


@router.post(
    "/",
    response_model=PublicationResponse,
)
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PublicationService.create_publication(
        db,
        publication,
        current_user,
    )


@router.get(
    "/",
    response_model=list[PublicationResponse],
)
def get_all_publications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db),
):
    return PublicationService.get_all_publications(
        db,
        skip,
        limit,
    )


@router.get(
    "/search",
    response_model=list[PublicationResponse],
)
def search_publications(
    keyword: str,
    db: Session = Depends(get_db),
):
    return PublicationService.search_publications(
        db,
        keyword,
    )


# ---------------- FILTER ROUTE ----------------

@router.get(
    "/filter",
    response_model=list[PublicationResponse],
)
def filter_publications(
    publication_year: int | None = None,
    publication_type: str | None = None,
    status: str | None = None,
    journal: str | None = None,
    conference: str | None = None,
    sort_by: str = "publication_year",
    order: str = "desc",
    db: Session = Depends(get_db),
):
    return PublicationService.filter_and_sort_publications(
        db=db,
        publication_year=publication_year,
        publication_type=publication_type,
        status=status,
        journal=journal,
        conference=conference,
        sort_by=sort_by,
        order=order,
    )


# ---------------- UUID ROUTES ----------------

@router.get(
    "/{publication_id}",
    response_model=PublicationResponse,
)
def get_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
):
    return PublicationService.get_publication(
        db,
        publication_id,
    )


@router.put(
    "/{publication_id}",
    response_model=PublicationResponse,
)
def update_publication(
    publication_id: UUID,
    publication: PublicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PublicationService.update_publication(
        db,
        publication_id,
        publication,
        current_user,
    )


@router.delete(
    "/{publication_id}",
)
def delete_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PublicationService.delete_publication(
        db,
        publication_id,
        current_user,
    )


@router.post(
    "/{publication_id}/upload",
)
def upload_publication_file(
    publication_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PublicationService.upload_file(
        db,
        publication_id,
        file,
        current_user,
    )


@router.get(
    "/{publication_id}/download",
)
def download_publication_file(
    publication_id: UUID,
    db: Session = Depends(get_db),
):
    return PublicationService.download_file(
        db,
        publication_id,
    )
