from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
)

from app.models.user import User, UserRole
from app.models.institution import Institution

from app.schemas.institution import (
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
)

from app.services.institution_service import InstitutionService


router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"],
)


# ============================================================
# HELPER
# SYSTEM ADMIN + INSTITUTION ADMIN
# ============================================================

def require_institution_manager(
    current_user: User,
):
    if current_user.role not in (
        UserRole.SYSTEM_ADMIN,
        UserRole.INSTITUTION_ADMIN,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only System Admin and Institution Admin "
                "can manage institutions."
            ),
        )


# ============================================================
# CREATE
# SYSTEM ADMIN + INSTITUTION ADMIN
# ============================================================

@router.post(
    "/",
    response_model=InstitutionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_institution(
    institution: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_institution_manager(current_user)

    return InstitutionService.create_institution(
        db,
        institution,
        current_user,
    )


# ============================================================
# GET ALL
# ============================================================

@router.get(
    "/",
    response_model=list[InstitutionResponse],
)
def get_institutions(
    db: Session = Depends(get_db),
):
    return InstitutionService.get_all_institutions(db)


# ============================================================
# EXPORT ALL INSTITUTIONS
# SYSTEM ADMIN + INSTITUTION ADMIN ONLY
# ============================================================

@router.get(
    "/export",
)
def export_all_institutions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_institution_manager(current_user)

    institutions = (
        db.query(Institution)
        .order_by(Institution.name.asc())
        .all()
    )

    return [
        {
            "id": str(institution.id),
            "name": institution.name,
            "abbreviation": institution.abbreviation,
            "website": institution.website,
            "email": institution.email,
            "phone": institution.phone,
            "address": institution.address,
            "city": institution.city,
            "state": institution.state,
            "country": institution.country,
        }
        for institution in institutions
    ]


# ============================================================
# GET ONE
# ============================================================

@router.get(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def get_institution(
    institution_id: UUID,
    db: Session = Depends(get_db),
):
    return InstitutionService.get_institution(
        db,
        institution_id,
    )


# ============================================================
# UPDATE
# SYSTEM ADMIN + INSTITUTION ADMIN
# ============================================================

@router.put(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def update_institution(
    institution_id: UUID,
    institution: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_institution_manager(current_user)

    return InstitutionService.update_institution(
        db,
        institution_id,
        institution,
        current_user,
    )


# ============================================================
# DELETE
# SYSTEM ADMIN + INSTITUTION ADMIN
# ============================================================

@router.delete(
    "/{institution_id}",
    response_model=InstitutionResponse,
)
def delete_institution(
    institution_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_institution_manager(current_user)

    # --------------------------------------------------------
    # Find institution
    # --------------------------------------------------------

    institution = (
        db.query(Institution)
        .filter(
            Institution.id == institution_id
        )
        .first()
    )

    if institution is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Institution not found.",
        )

    # --------------------------------------------------------
    # Save response before delete
    # --------------------------------------------------------

    response = InstitutionResponse.model_validate(
        institution
    )

    # --------------------------------------------------------
    # Delete
    # --------------------------------------------------------

    db.delete(institution)
    db.commit()

    return response