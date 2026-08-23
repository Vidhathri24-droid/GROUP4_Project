from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
    require_system_admin,
)

from app.schemas.researcher import (
    ResearcherCreate,
    ResearcherUpdate,
    ResearcherResponse,
)

from app.services.researcher_service import ResearcherService


router = APIRouter(
    prefix="/researchers",
    tags=["Researchers"],
)


# ============================================================
# CREATE RESEARCHER
# ONLY SYSTEM ADMIN AND INSTITUTION ADMIN
# ============================================================

@router.post(
    "/",
    response_model=ResearcherResponse,
    status_code=201,
)
def create_researcher(
    researcher: ResearcherCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    # --------------------------------------------------------
    # Check authorization
    # --------------------------------------------------------

    role = current_user.role

    # Support both Enum values and plain strings
    role_value = (
        role.value
        if hasattr(role, "value")
        else str(role)
    )

    allowed_roles = {
        "SYSTEM_ADMIN",
        "INSTITUTION_ADMIN",
    }

    if role_value not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail=(
                "Only System Admin and Institution Admin "
                "are allowed to create researcher profiles."
            ),
        )

    # --------------------------------------------------------
    # Create researcher
    # --------------------------------------------------------

    return ResearcherService.create_researcher(
        db,
        researcher,
    )


# ============================================================
# GET ALL RESEARCHERS
# ============================================================

@router.get(
    "/",
    response_model=list[ResearcherResponse],
)
def get_researchers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return ResearcherService.get_all_researchers(
        db,
    )


# ============================================================
# SEARCH RESEARCHERS
# ============================================================

@router.get(
    "/search",
)
def search_researchers(
    query: str = Query(""),
    db: Session = Depends(get_db),
):

    return ResearcherService.search_researchers(
        db,
        query,
    )


# ============================================================
# GET SINGLE RESEARCHER
# ============================================================

@router.get(
    "/{researcher_id}",
    response_model=ResearcherResponse,
)
def get_researcher(
    researcher_id: UUID,
    db: Session = Depends(get_db),
):

    return ResearcherService.get_researcher(
        db,
        researcher_id,
    )


# ============================================================
# UPDATE RESEARCHER
# ============================================================

@router.put(
    "/{researcher_id}",
    response_model=ResearcherResponse,
)
def update_researcher(
    researcher_id: UUID,
    researcher: ResearcherUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return ResearcherService.update_researcher(
        db,
        researcher_id,
        researcher,
    )


# ============================================================
# DELETE RESEARCHER
# ============================================================

@router.delete(
    "/{researcher_id}",
)
def delete_researcher(
    researcher_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_system_admin),
):

    return ResearcherService.delete_researcher(
        db,
        researcher_id,
    )