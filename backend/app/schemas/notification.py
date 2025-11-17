from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    """通知ベーススキーマ"""
    notification_type: str
    title: str
    message: Optional[str] = None
    related_id: Optional[int] = None
    related_type: Optional[str] = None


class NotificationCreate(NotificationBase):
    """通知作成スキーマ"""
    user_id: int


class NotificationUpdate(BaseModel):
    """通知更新スキーマ"""
    is_read: Optional[bool] = None


class Notification(NotificationBase):
    """通知レスポンススキーマ"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
