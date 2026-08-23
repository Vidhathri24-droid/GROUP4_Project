from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user, require_admin
from app.schemas.user import UserUpdate
from app.services.user_service import UserService


router = APIRouter(prefix="/users", tags=["Users"])


# =========================================================
# GET ALL USERS - SYSTEM ADMIN ONLY
# =========================================================

@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return UserService.get_all_users(db)


# =========================================================
# GET ONE USER
# =========================================================

@router.get("/{user_id}")
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = UserService.get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


# =========================================================
# UPDATE USER / ASSIGN ROLE - SYSTEM ADMIN ONLY
# =========================================================

@router.put("/{user_id}")
def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    user = UserService.get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Do not allow the current System Admin to remove
    # their own admin access.
    if (
        current_user.id == user.id
        and data.role is not None
        and data.role != current_user.role
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "You cannot change your own role. "
                "Use another System Admin account."
            ),
        )

    return UserService.update_user(db, user, data)


# =========================================================
# DELETE USER - SYSTEM ADMIN ONLY
# =========================================================

@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    user = UserService.get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if current_user.id == user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account.",
        )

    UserService.delete_user(db, user)

    return {"message": "User deleted successfully"}
