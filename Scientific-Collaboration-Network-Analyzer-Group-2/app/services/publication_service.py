from uuid import UUID
import os
import shutil

from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.models.publication import Publication
from app.models.user import User
from app.repositories.publication_repository import publication_repository
from app.schemas.publication import (
    PublicationCreate,
    PublicationUpdate,
)

# Upload directory
BASE_DIR = os.path.abspath(os.getcwd())
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "publications")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class PublicationService:

    @staticmethod
    def create_publication(
        db: Session,
        publication: PublicationCreate,
        current_user: User,
    ) -> Publication:

        if publication.doi:
            existing = publication_repository.get_by_doi(
                db,
                publication.doi,
            )

            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Publication with this DOI already exists.",
                )

        data = publication.model_dump()

        # Convert HttpUrl -> str
        if data.get("url") is not None:
            data["url"] = str(data["url"])

        db_publication = Publication(
            **data,
            owner_id=current_user.id,
        )

        return publication_repository.create(
            db,
            db_publication,
        )

    @staticmethod
    def get_publication(
        db: Session,
        publication_id: UUID,
    ) -> Publication:

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=404,
                detail="Publication not found.",
            )

        return publication

    @staticmethod
    def get_all_publications(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Publication]:

        return publication_repository.get_all(
            db,
            skip,
            limit,
        )

    @staticmethod
    def update_publication(
        db: Session,
        publication_id: UUID,
        publication_update: PublicationUpdate,
        current_user: User,
    ) -> Publication:

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=404,
                detail="Publication not found.",
            )

        if publication.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to update this publication.",
            )

        update_data = publication_update.model_dump(
            exclude_unset=True,
        )

        if update_data.get("url") is not None:
            update_data["url"] = str(update_data["url"])

        for key, value in update_data.items():
            setattr(
                publication,
                key,
                value,
            )

        return publication_repository.update(
            db,
            publication,
        )

    @staticmethod
    def delete_publication(
        db: Session,
        publication_id: UUID,
        current_user: User,
    ) -> dict:

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=404,
                detail="Publication not found.",
            )

        if publication.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to delete this publication.",
            )

        publication_repository.delete(
            db,
            publication,
        )

        return {
            "message": "Publication deleted successfully."
        }

    @staticmethod
    def search_publications(
        db: Session,
        keyword: str,
    ) -> list[Publication]:

        return publication_repository.search(
            db,
            keyword,
        )

    @staticmethod
    def upload_file(
        db: Session,
        publication_id: UUID,
        file: UploadFile,
        current_user: User,
    ) -> dict:

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=404,
                detail="Publication not found.",
            )

        if publication.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to upload files for this publication.",
            )

        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        filename = f"{publication.id}.pdf"

        filepath = os.path.join(
            UPLOAD_DIR,
            filename,
        )

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        publication.file_name = file.filename
        publication.file_path = filepath
        publication.file_size = os.path.getsize(filepath)
        publication.file_type = file.content_type

        publication_repository.update(
            db,
            publication,
        )

        return {
            "message": "PDF uploaded successfully.",
            "filename": publication.file_name,
        }

    @staticmethod
    def download_file(
        db: Session,
        publication_id: UUID,
    ):

        publication = publication_repository.get_by_id(
            db,
            publication_id,
        )

        if publication is None:
            raise HTTPException(
                status_code=404,
                detail="Publication not found.",
            )

        if not publication.file_path:
            raise HTTPException(
                status_code=404,
                detail="No PDF uploaded.",
            )

        if not os.path.exists(publication.file_path):
            raise HTTPException(
                status_code=404,
                detail="PDF file not found on the server.",
            )

        return FileResponse(
            path=publication.file_path,
            filename=publication.file_name,
            media_type="application/pdf",
        )

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
