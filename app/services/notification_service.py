import uuid
from typing import Dict, List

from fastapi import WebSocket
from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.repositories.notification_repository import (
    NotificationRepository,
)


class NotificationManager:
    """
    Maintains active WebSocket connections for logged-in users.
    """

    def __init__(self):
        self.connections: Dict[
            uuid.UUID,
            List[WebSocket]
        ] = {}

    async def connect(
        self,
        user_id: uuid.UUID,
        websocket: WebSocket,
    ):
        await websocket.accept()

        if user_id not in self.connections:
            self.connections[user_id] = []

        self.connections[user_id].append(websocket)

    def disconnect(
        self,
        user_id: uuid.UUID,
        websocket: WebSocket,
    ):
        if user_id not in self.connections:
            return

        if websocket in self.connections[user_id]:
            self.connections[user_id].remove(websocket)

        if not self.connections[user_id]:
            del self.connections[user_id]

    async def send_to_user(
        self,
        user_id: uuid.UUID,
        data: dict,
    ):
        connections = self.connections.get(user_id, [])

        disconnected = []

        for websocket in connections:
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(
                user_id,
                websocket,
            )


notification_manager = NotificationManager()


class NotificationService:

    @staticmethod
    def create_notification(
        db: Session,
        user_id: uuid.UUID,
        title: str,
        message: str,
        notification_type: str,
        reference_id: uuid.UUID | None = None,
    ):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            reference_id=reference_id,
            is_read=False,
        )

        return NotificationRepository.create(
            db,
            notification,
        )

    @staticmethod
    def notification_to_dict(
        notification: Notification,
    ):
        return {
            "id": str(notification.id),
            "user_id": str(notification.user_id),
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "reference_id": (
                str(notification.reference_id)
                if notification.reference_id
                else None
            ),
            "is_read": notification.is_read,
            "created_at": (
                notification.created_at.isoformat()
                if notification.created_at
                else None
            ),
        }