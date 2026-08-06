from uuid import UUID

<<<<<<< HEAD
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
=======
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_db,
    get_current_user,
)

from app.models.collaboration import Collaboration
from app.repositories.collaboration_repository import CollaborationRepository
from app.schemas.collaborations import CollaborationCreate
from app.services.collaboration_service import CollaborationService
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab

router = APIRouter(
    prefix="/collaborations",
    tags=["Collaborations"],
)


<<<<<<< HEAD
@router.post("/")
def create_collaboration(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
):
    return CollaborationService.create(db, data)


@router.get("/")
def get_all_collaborations(
    db: Session = Depends(get_db),
=======
# Send Collaboration Request
@router.post("/request")
def send_request(
    data: CollaborationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CollaborationService.send_request(
        db,
        current_user.id,
        data.receiver_id,
    )


# Get All Collaborations
@router.get("/")
def get_all_collaborations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
):
    return CollaborationService.get_all(db)


<<<<<<< HEAD
@router.get("/{collaboration_id}")
def get_collaboration(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
):
    return CollaborationService.get(
=======
# Get Pending Requests
@router.get("/pending")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return CollaborationService.get_pending_requests(
        db,
        current_user.id,
    )


# Accept Collaboration Request
@router.put("/{collaboration_id}/accept")
def accept_request(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collaboration = CollaborationRepository.get_by_id(
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
        db,
        collaboration_id,
    )

<<<<<<< HEAD

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
=======
    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration request not found",
        )

    return CollaborationService.accept_request(
        db,
        collaboration,
    )


# Reject Collaboration Request
@router.put("/{collaboration_id}/reject")
def reject_request(
    collaboration_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    collaboration = CollaborationRepository.get_by_id(
        db,
        collaboration_id,
    )

    if collaboration is None:
        raise HTTPException(
            status_code=404,
            detail="Collaboration request not found",
        )

    return CollaborationService.reject_request(
        db,
        collaboration,
    )
>>>>>>> 626098bf379b3e68d1d64c3dde03b1a0268c27ab
