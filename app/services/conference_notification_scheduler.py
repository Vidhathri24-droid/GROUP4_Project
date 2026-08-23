"""
Conference notification scheduler.

Handles automatic conference reminder notifications.

The scheduler checks periodically for conferences that are about
to start and sends notifications to registered researchers.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.conference import Conference
from app.models.conference_registration import ConferenceRegistration
from app.models.notification import Notification


logger = logging.getLogger(__name__)

_scheduler_task = None


REMINDER_MINUTES_BEFORE = 60
CHECK_INTERVAL_SECONDS = 60


async def _send_conference_reminders():
    """
    Find conferences that are about to start and create in-app
    notifications for registered researchers.

    A registration is marked with reminder_sent_at so that the
    same reminder is not sent repeatedly.
    """

    while True:
        db = SessionLocal()

        try:
            now = datetime.now(timezone.utc)
            reminder_until = now + timedelta(
                minutes=REMINDER_MINUTES_BEFORE
            )

            conferences = db.execute(
                select(Conference)
            ).scalars().all()

            for conference in conferences:

                conference_date = getattr(
                    conference,
                    "conference_date",
                    None,
                )

                conference_time = getattr(
                    conference,
                    "conference_time",
                    None,
                )

                if not conference_date:
                    continue

                # --------------------------------------------------
                # Build conference start datetime
                # --------------------------------------------------

                if conference_time:
                    try:
                        if isinstance(conference_time, str):
                            parsed_time = datetime.strptime(
                                conference_time,
                                "%H:%M:%S",
                            ).time()
                        else:
                            parsed_time = conference_time

                        conference_start = datetime.combine(
                            conference_date,
                            parsed_time,
                        ).replace(tzinfo=timezone.utc)

                    except (ValueError, TypeError):
                        logger.warning(
                            "Unable to parse conference time for "
                            "conference %s",
                            conference.id,
                        )
                        continue

                else:
                    # If no time is specified, do not send an
                    # automatic "starting soon" reminder.
                    continue

                # --------------------------------------------------
                # Only process conferences starting within the
                # reminder window.
                # --------------------------------------------------

                if not (
                    now <= conference_start <= reminder_until
                ):
                    continue

                registrations = db.execute(
                    select(ConferenceRegistration).where(
                        ConferenceRegistration.conference_id
                        == conference.id,
                        ConferenceRegistration.reminder_sent_at
                        .is_(None),
                    )
                ).scalars().all()

                if not registrations:
                    continue

                for registration in registrations:

                    user_id = getattr(
                        registration,
                        "user_id",
                        None,
                    )

                    if not user_id:
                        continue

                    title = (
                        getattr(
                            conference,
                            "title",
                            None,
                        )
                        or "Conference"
                    )

                    message = (
                        f"The conference "
                        f"'{title}' "
                        f"you registered for is about to start soon."
                    )

                    notification = Notification(
                        user_id=user_id,
                        notification_type="CONFERENCE",
                        message=message,
                        is_read=False,
                    )

                    db.add(notification)

                    registration.reminder_sent_at = now

                db.commit()

        except Exception:
            db.rollback()

            logger.exception(
                "Error while processing conference reminders."
            )

        finally:
            db.close()

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)


def start_conference_notification_scheduler():
    """
    Start the conference notification scheduler.

    This function is intentionally safe to call more than once.
    """

    global _scheduler_task

    if _scheduler_task is not None:
        if not _scheduler_task.done():
            return _scheduler_task

    try:
        loop = asyncio.get_running_loop()

        _scheduler_task = loop.create_task(
            _send_conference_reminders()
        )

        logger.info(
            "Conference notification scheduler started."
        )

        return _scheduler_task

    except RuntimeError:
        logger.warning(
            "No running event loop. "
            "Conference notification scheduler was not started."
        )

        return None


def stop_conference_notification_scheduler():
    """
    Stop the conference notification scheduler.
    """

    global _scheduler_task

    if _scheduler_task is not None:
        _scheduler_task.cancel()
        _scheduler_task = None

        logger.info(
            "Conference notification scheduler stopped."
        )