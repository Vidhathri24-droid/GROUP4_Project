import os
import shutil
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.publication import (Publication, PublicationStatus)
from app.repositories.publication_repository import publication_repository
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
)
from app.models.user import User, UserRole

UPLOAD_DIRECTORY = "uploads/publications"

os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


class PublicationService:

    @staticmethod
    def create_publication(
        db: Session,
        publication: PublicationCreate,
        owner_id: uuid.UUID,
    ):
        existing = None

        if publication.doi:
            existing = publication_repository.get_by_doi(
                db,
                publication.doi,
            )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Publication with this DOI already exists.",
            )

        db_publication = Publication(
            title=publication.title,
            abstract=publication.abstract,
            doi=publication.doi,
            journal=publication.journal,
            conference=publication.conference,
            publication_year=publication.publication_year,
            publication_type=publication.publication_type,
            status=PublicationStatus.SUBMITTED,
            url=str(publication.url) if publication.url else None,
            citation_count=publication.citation_count,
            owner_id=owner_id,
        )

        return publication_repository.create(
            db,
            db_publication,
        )

    @staticmethod
    def get_publication(
        db: Session,
        publication_id: uuid.UUID,
    ):
        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        return publication

    @staticmethod
    def get_all_publications(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):
        return (
            db.query(Publication)
            .filter(
                Publication.status == PublicationStatus.ACCEPTED
            )
            .order_by(
                Publication.publication_year.desc()
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def search_publications(
        db: Session,
        keyword: str,
    ):
        return publication_repository.search(
            db,
            keyword,
        )

    @staticmethod
    def update_publication(
        db: Session,
        publication_id: uuid.UUID,
        publication_data: PublicationUpdate,
        current_user_id: uuid.UUID,
    ):
        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        if publication.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to update this publication.",
            )

        update_data = publication_data.model_dump(
            exclude_unset=True
        )

        if "url" in update_data and update_data["url"] is not None:
            update_data["url"] = str(update_data["url"])

        if (
            "doi" in update_data
            and update_data["doi"] != publication.doi
            and update_data["doi"] is not None
        ):
            existing = publication_repository.get_by_doi(
                db,
                update_data["doi"],
            )

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Publication with this DOI already exists.",
                )

        for key, value in update_data.items():
            setattr(publication, key, value)

        return publication_repository.update(
            db,
            publication,
        )

    @staticmethod
    def delete_publication(
        db: Session,
        publication_id: uuid.UUID,
        current_user: User,
    ):
        # ============================================================
        # ONLY SYSTEM ADMIN + INSTITUTION ADMIN
        # ============================================================

        if current_user.role not in (
            UserRole.SYSTEM_ADMIN,
            UserRole.INSTITUTION_ADMIN,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only System Admin and Institution Admin "
                    "can delete publications."
                ),
            )

        # ============================================================
        # FIND PUBLICATION
        # ============================================================

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        # ============================================================
        # DELETE ASSOCIATED PDF FILE
        # ============================================================

        if (
            publication.file_path
            and os.path.exists(publication.file_path)
        ):
            try:
                os.remove(publication.file_path)
            except OSError:
                pass

        # ============================================================
        # DELETE DATABASE RECORD
        # ============================================================

        publication_repository.delete(
            db,
            publication,
        )

        return {
            "message": "Publication deleted successfully."
        }

    @staticmethod
    def upload_file(
        db: Session,
        publication_id: uuid.UUID,
        file: UploadFile,
        current_user_id: uuid.UUID,
    ):
        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        if publication.owner_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to upload files for this publication.",
            )

        if publication.file_path and os.path.exists(publication.file_path):
            os.remove(publication.file_path)

        extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{extension}"
        destination = os.path.join(
            UPLOAD_DIRECTORY,
            unique_filename,
        )

        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        publication.file_name = file.filename
        publication.file_path = destination
        publication.file_size = os.path.getsize(destination)
        publication.file_type = file.content_type

        return publication_repository.update(
            db,
            publication,
        )

    @staticmethod
    def download_file(
        db: Session,
        publication_id: uuid.UUID,
    ):
        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        if (
            not publication.file_path
            or not os.path.exists(publication.file_path)
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No file uploaded for this publication.",
            )

        return publication

    @staticmethod
    def filter_and_sort_publications(
        db: Session,
        publication_year: int | None = None,
        publication_type: str | None = None,
        status: str | None = None,
        journal: str | None = None,
        conference: str | None = None,
        sort_by: str = "publication_year",
        order: str = "desc",
    ):
        return publication_repository.filter_and_sort(
            db=db,
            publication_year=publication_year,
            publication_type=publication_type,
            status=status,
            journal=journal,
            conference=conference,
            sort_by=sort_by,
            order=order,
        )

    def get_accepted_publications(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ):
        return (
            db.query(Publication)
            .filter(
                Publication.status == PublicationStatus.ACCEPTED
            )
            .order_by(
                Publication.publication_year.desc()
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_reviewer_publications(
        db: Session,
        current_user: User,
        status_filter: str | None = None,
    ):
        if current_user.role != UserRole.REVIEWER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only reviewers can access reviewer publications.",
            )

        query = db.query(Publication)

        if status_filter:
            try:
                publication_status = PublicationStatus[status_filter.upper()]
            except KeyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid publication status.",
                )

            query = query.filter(
                Publication.status == publication_status
            )

        else:
            query = query.filter(
                Publication.status.in_(
                    [
                        PublicationStatus.SUBMITTED,
                        PublicationStatus.ACCEPTED,
                        PublicationStatus.REJECTED,
                    ]
                )
            )

        return query.order_by(
            Publication.created_at.desc()
        ).all()

    @staticmethod
    def review_publication(
        db: Session,
        publication_id: uuid.UUID,
        current_user: User,
        new_status: str,
    ):
        if current_user.role != UserRole.REVIEWER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only reviewers can review publications.",
            )

        if new_status not in ("ACCEPTED", "REJECTED"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Review status must be ACCEPTED or REJECTED.",
            )

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if not publication:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Publication not found.",
            )

        if publication.status != PublicationStatus.SUBMITTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only submitted publications can be reviewed.",
            )

        if new_status == "ACCEPTED":
            publication.status = PublicationStatus.ACCEPTED
        else:
            publication.status = PublicationStatus.REJECTED

        return publication_repository.update(
            db,
            publication,
        )
publication_service = PublicationService()
