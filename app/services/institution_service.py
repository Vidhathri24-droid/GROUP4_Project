from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.institution import Institution
from app.repositories.institution_repository import InstitutionRepository
from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
)
from app.models.user import User, UserRole


class InstitutionService:

    # ============================================================
    # ROLE CHECK
    # SYSTEM ADMIN + INSTITUTION ADMIN
    # ============================================================

    @staticmethod
    def _can_manage_institutions(current_user: User) -> bool:
        return current_user.role in (
            UserRole.SYSTEM_ADMIN,
            UserRole.INSTITUTION_ADMIN,
        )

    # ============================================================
    # CREATE INSTITUTION
    # SYSTEM ADMIN + INSTITUTION ADMIN
    # ============================================================

    @staticmethod
    def create_institution(
        db: Session,
        data: InstitutionCreate,
        current_user: User,
    ):
        if not InstitutionService._can_manage_institutions(
            current_user
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only System Admin and Institution Admin "
                    "can create institutions."
                ),
            )

        # --------------------------------------------------------
        # Check duplicate institution name
        # --------------------------------------------------------

        existing = InstitutionRepository.get_by_name(
            db,
            data.name,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institution already exists",
            )

        # --------------------------------------------------------
        # Create institution
        # --------------------------------------------------------

        institution = Institution(
            **data.model_dump()
        )

        return InstitutionRepository.create(
            db,
            institution,
        )

    # ============================================================
    # GET ALL INSTITUTIONS
    # ============================================================

    @staticmethod
    def get_all_institutions(
        db: Session,
    ):
        return InstitutionRepository.get_all(db)

    # ============================================================
    # GET ONE INSTITUTION
    # ============================================================

    @staticmethod
    def get_institution(
        db: Session,
        institution_id: UUID,
    ):
        institution = InstitutionRepository.get_by_id(
            db,
            institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found",
            )

        return institution

    # ============================================================
    # UPDATE INSTITUTION
    # SYSTEM ADMIN + INSTITUTION ADMIN
    # ============================================================

    @staticmethod
    def update_institution(
        db: Session,
        institution_id: UUID,
        data: InstitutionUpdate,
        current_user: User,
    ):
        if not InstitutionService._can_manage_institutions(
            current_user
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only System Admin and Institution Admin "
                    "can update institutions."
                ),
            )

        # --------------------------------------------------------
        # Find institution
        # --------------------------------------------------------

        institution = InstitutionRepository.get_by_id(
            db,
            institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found",
            )

        # --------------------------------------------------------
        # Apply only supplied fields
        # --------------------------------------------------------

        updates = data.model_dump(
            exclude_unset=True
        )

        # --------------------------------------------------------
        # Prevent accidental duplicate institution names
        # --------------------------------------------------------

        if "name" in updates:
            existing = InstitutionRepository.get_by_name(
                db,
                updates["name"],
            )

            if (
                existing is not None
                and existing.id != institution.id
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Institution already exists",
                )

        # --------------------------------------------------------
        # Update institution
        # --------------------------------------------------------

        for key, value in updates.items():
            setattr(
                institution,
                key,
                value,
            )

        db.commit()
        db.refresh(institution)

        return institution

    # ============================================================
    # DELETE INSTITUTION
    # SYSTEM ADMIN + INSTITUTION ADMIN
    # ============================================================

    @staticmethod
    def delete_institution(
        db: Session,
        institution_id: UUID,
        current_user: User,
    ):
        if not InstitutionService._can_manage_institutions(
            current_user
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only System Admin and Institution Admin "
                    "can delete institutions."
                ),
            )

        # --------------------------------------------------------
        # Find institution
        # --------------------------------------------------------

        institution = InstitutionRepository.get_by_id(
            db,
            institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Institution not found",
            )

        # --------------------------------------------------------
        # Delete institution
        # --------------------------------------------------------

        InstitutionRepository.delete(
            db,
            institution,
        )

        return {
            "message": "Institution deleted successfully"
        }