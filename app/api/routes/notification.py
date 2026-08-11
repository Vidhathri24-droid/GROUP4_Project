from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.repositories.notification_repository import (
    NotificationRepository,
)
from app.services.notification_service import (
    notification_manager,
    NotificationService,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# ============================================================
# GET NOTIFICATIONS
# ============================================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = (
        NotificationRepository.get_user_notifications(
            db,
            current_user.id,
        )
    )

    return [
        NotificationService.notification_to_dict(
            notification
        )
        for notification in notifications
    ]


# ============================================================
# UNREAD COUNT
# ============================================================

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = NotificationRepository.get_unread_count(
        db,
        current_user.id,
    )

    return {
        "count": count
    }


# ============================================================
# MARK ALL AS READ
# IMPORTANT: MUST BE BEFORE /{notification_id}/read
# ============================================================

@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    NotificationRepository.mark_all_as_read(
        db,
        current_user.id,
    )

    return {
        "message": "All notifications marked as read"
    }


# ============================================================
# MARK ONE AS READ
# ============================================================

@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = NotificationRepository.mark_as_read(
        db,
        notification_id,
        current_user.id,
    )

    if notification is None:
        return {
            "message": "Notification not found"
        }

    return NotificationService.notification_to_dict(
        notification
    )


# ============================================================
# REAL-TIME WEBSOCKET
# ============================================================

@router.websocket("/ws")
async def notification_websocket(
    websocket: WebSocket,
    user_id: UUID,
):
    await notification_manager.connect(
        user_id,
        websocket,
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        notification_manager.disconnect(
            user_id,
            websocket,
        )