from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.schemas.collaboration import (
    CollaborationCreate,
    CollaborationUpdate,
)

from app.services.collaboration_service import (
    CollaborationService,
)

router = APIRouter(
    prefix="/collaborations",
    tags=["Collaborations"],
)


@router.post("/")
def create_collaboration(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
):
    return CollaborationService.create(db, data)


@router.get("/")
def get_all_collaborations(
    db: Session = Depends(get_db),
):
    return CollaborationService.get_all(db)


@router.get("/{collaboration_id}")
def get_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
):
    return CollaborationService.get(
        db,
        collaboration_id,
    )


@router.put("/{collaboration_id}")
def update_collaboration(
    collaboration_id: UUID,
    data: CollaborationUpdate,
    db: Session = Depends(get_db),
):
    return CollaborationService.update(
        db,
        collaboration_id,
        data,
    )


@router.delete("/{collaboration_id}")
def delete_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
):
    return CollaborationService.delete(
        db,
        collaboration_id,
    )
