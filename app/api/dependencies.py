from app.db.database import SessionLocal
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from sqlalchemy.orm import Session
from app.repositories.user_repository import  UserRepository
from app.models.user import User,UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    email = payload["sub"]

    user = UserRepository.get_by_email(
        db,
        email
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def require_system_admin(
    current_user: User = Depends(get_current_user),
):
    """
    Allow access only to System Administrators.

    This is a backend security check.
    Frontend visibility checks are NOT sufficient.
    """

    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System Administrator privileges required.",
        )

    return current_user

def require_admin(current_user=Depends(get_current_user)):

    if current_user.role != UserRole.SYSTEM_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user

def require_researcher(current_user=Depends(get_current_user)):

    if current_user.role != UserRole.RESEARCHER:
        raise HTTPException(
            status_code=403,
            detail="Researcher access required"
        )

    return current_user

def require_reviewer(current_user=Depends(get_current_user)):

    if current_user.role != UserRole.REVIEWER:
        raise HTTPException(
            status_code=403,
            detail="Reviewer access required"
        )

    return current_user