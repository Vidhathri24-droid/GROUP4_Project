from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:

    @staticmethod
    def create(
        db: Session,
        notification: Notification,
    ):
        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: UUID,
    ):
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_unread_count(
        db: Session,
        user_id: UUID,
    ):
        return (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .count()
        )

    @staticmethod
    def mark_as_read(
        db: Session,
        notification_id: UUID,
        user_id: UUID,
    ):
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)

        return notification

    @staticmethod
    def mark_all_as_read(
        db: Session,
        user_id: UUID,
    ):
        (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .update(
                {"is_read": True},
                synchronize_session=False,
            )
        )

        db.commit()

    @staticmethod
    def delete_notification(
        db: Session,
        notification_id: UUID,
        user_id: UUID,
    ) -> bool:
        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification:
            db.delete(notification)
            db.commit()
            return True

        return False