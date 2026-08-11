from uuid import UUID

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Query,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_user,
    get_db,
)
from app.models.user import User
from app.schemas.publication import (
    PublicationCreate,
    PublicationResponse,
    PublicationUpdate,
)
from app.services.publication_service import publication_service
from app.services.notification_service import (
    NotificationService,
    notification_manager,
)

router = APIRouter(
    prefix="/publications",
    tags=["Publications"],
)


@router.post(
    "/",
    response_model=PublicationResponse,
    status_code=201,
)
def create_publication(
    publication: PublicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publication_service.create_publication(
        db=db,
        publication=publication,
        owner_id=current_user.id,
    )


@router.get(
    "/",
    response_model=list[PublicationResponse],
)
def get_all_publications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return publication_service.get_accepted_publications(
        db=db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/reviewer",
    response_model=list[PublicationResponse],
)
def get_reviewer_publications(
    status_filter: str | None = Query(
        default=None,
        alias="status"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publication_service.get_reviewer_publications(
        db=db,
        current_user=current_user,
        status_filter=status_filter,
    )


# ============================================================
# REVIEW PUBLICATION
# ============================================================

@router.put(
    "/{publication_id}/review",
    response_model=PublicationResponse,
)
def review_publication(
    publication_id: UUID,
    review_status: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None,
):
    # Reviewer accepts/rejects the publication
    publication = publication_service.review_publication(
        db=db,
        publication_id=publication_id,
        current_user=current_user,
        new_status=review_status,
    )

    # Normalize status
    normalized_status = str(publication.status).upper()

    # Only create notification for ACCEPTED / REJECTED
    if normalized_status in {"ACCEPTED", "REJECTED"}:

        if normalized_status == "ACCEPTED":
            title = "Publication Accepted"
            message = (
                f'Your publication "{publication.title}" '
                "has been accepted by the reviewer."
            )
        else:
            title = "Publication Rejected"
            message = (
                f'Your publication "{publication.title}" '
                "has been rejected by the reviewer."
            )

        # Save notification in database
        notification = NotificationService.create_notification(
            db=db,
            user_id=publication.owner_id,
            title=title,
            message=message,
            notification_type="PUBLICATION_REVIEW",
            reference_id=publication.id,
        )

        # Send notification immediately through WebSocket
        if background_tasks is not None:
            background_tasks.add_task(
                notification_manager.send_to_user,
                publication.owner_id,
                NotificationService.notification_to_dict(
                    notification
                ),
            )

    return publication


@router.get(
    "/search",
    response_model=list[PublicationResponse],
)
def search_publications(
    keyword: str = Query(...),
    db: Session = Depends(get_db),
):
    return publication_service.search_publications(
        db=db,
        keyword=keyword,
    )


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
    return publication_service.filter_and_sort_publications(
        db=db,
        publication_year=publication_year,
        publication_type=publication_type,
        status=status,
        journal=journal,
        conference=conference,
        sort_by=sort_by,
        order=order,
    )


@router.get(
    "/{publication_id}",
    response_model=PublicationResponse,
)
def get_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
):
    return publication_service.get_publication(
        db=db,
        publication_id=publication_id,
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
    return publication_service.update_publication(
        db=db,
        publication_id=publication_id,
        publication_data=publication,
        current_user_id=current_user.id,
    )


@router.delete(
    "/{publication_id}",
)
def delete_publication(
    publication_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publication_service.delete_publication(
        db=db,
        publication_id=publication_id,
        current_user=current_user,
    )


@router.post(
    "/{publication_id}/upload",
    response_model=PublicationResponse,
)
def upload_publication_file(
    publication_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return publication_service.upload_file(
        db=db,
        publication_id=publication_id,
        file=file,
        current_user_id=current_user.id,
    )


@router.get(
    "/{publication_id}/download",
)
def download_publication_file(
    publication_id: UUID,
    db: Session = Depends(get_db),
):
    publication = publication_service.download_file(
        db=db,
        publication_id=publication_id,
    )

    return FileResponse(
        path=publication.file_path,
        filename=publication.file_name,
        media_type=publication.file_type,
    )