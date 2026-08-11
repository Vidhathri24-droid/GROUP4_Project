from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: str
    reference_id: UUID | None = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)