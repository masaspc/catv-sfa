from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate


class CRUDNotification(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):
    """通知CRUD操作"""

    def get_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100, unread_only: bool = False
    ) -> List[Notification]:
        """ユーザーの通知を取得"""
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)

        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, db: Session, *, user_id: int) -> int:
        """ユーザーの未読通知数を取得"""
        return db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).count()

    def mark_as_read(self, db: Session, *, notification_id: int) -> Optional[Notification]:
        """通知を既読にする"""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    def mark_all_as_read(self, db: Session, *, user_id: int) -> int:
        """ユーザーの全通知を既読にする"""
        count = db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).update({"is_read": True})
        db.commit()
        return count

    def create_notification(
        self,
        db: Session,
        *,
        user_id: int,
        notification_type: str,
        title: str,
        message: str = None,
        related_id: int = None,
        related_type: str = None
    ) -> Notification:
        """通知を作成（簡易メソッド）"""
        obj_in = NotificationCreate(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_id=related_id,
            related_type=related_type
        )
        return self.create(db, obj_in=obj_in)


crud_notification = CRUDNotification(Notification)
