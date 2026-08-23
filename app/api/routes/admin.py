from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Allow only System Admin and Institution Admin."""
    if current_user.role not in {
        UserRole.SYSTEM_ADMIN,
        UserRole.INSTITUTION_ADMIN,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return users for both admin panels."""
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(user.id),
            "username": getattr(user, "username", None),
            "email": user.email,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "is_active": getattr(user, "is_active", True),
            "created_at": user.created_at.isoformat() if getattr(user, "created_at", None) else None,
        }
        for user in users
    ]


from typing import Optional
from pydantic import BaseModel


class RoleUpdatePayload(BaseModel):
    role: Optional[UserRole] = None


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: UUID,
    role: Optional[UserRole] = None,
    payload: Optional[RoleUpdatePayload] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    System Admin: may assign any role.
    Institution Admin: may assign only Researcher or Reviewer.
    Neither admin can change their own role.
    """
    target_role = role or (payload.role if payload else None)

    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be provided via query parameter or JSON body.",
        )

    role = target_role

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role.",
        )

    if current_user.role == UserRole.INSTITUTION_ADMIN:
        if role not in {UserRole.RESEARCHER, UserRole.REVIEWER}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institution Admin can only assign Researcher or Reviewer roles.",
            )

        # Explicitly prevent changing another administrator.
        if user.role in {UserRole.INSTITUTION_ADMIN, UserRole.SYSTEM_ADMIN}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institution Admin cannot change the role of an Institution Admin or System Admin.",
            )

    old_role = user.role
    user.role = role
    db.commit()
    db.refresh(user)

    new_role = user.role.value if hasattr(user.role, "value") else str(user.role)

    return {
        "message": "User role updated successfully.",
        "id": str(user.id),
        "username": getattr(user, "username", None),
        "email": user.email,
        "role": new_role,
        "user": {
            "id": str(user.id),
            "username": getattr(user, "username", None),
            "email": user.email,
            "role": new_role,
        },
    }
