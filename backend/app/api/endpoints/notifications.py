from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_notification
from app.models.user import User
from app.schemas.notification import Notification, NotificationCreate, NotificationUpdate

router = APIRouter()


@router.get("", response_model=List[Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    current_user: User = Depends(deps.get_current_user),
) -> List[Notification]:
    """
    現在のユーザーの通知一覧を取得
    """
    notifications = crud_notification.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit, unread_only=unread_only
    )
    return notifications


@router.get("/unread-count", response_model=int)
def get_unread_count(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> int:
    """
    現在のユーザーの未読通知数を取得
    """
    count = crud_notification.get_unread_count(db, user_id=current_user.id)
    return count


@router.post("", response_model=Notification)
def create_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_in: NotificationCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Notification:
    """
    通知を作成（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    notification = crud_notification.create(db, obj_in=notification_in)
    return notification


@router.put("/{notification_id}/read", response_model=Notification)
def mark_notification_as_read(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Notification:
    """
    通知を既読にする
    """
    notification = crud_notification.get(db, id=notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # 自分の通知のみ既読にできる
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    notification = crud_notification.mark_as_read(db, notification_id=notification_id)
    return notification


@router.put("/read-all")
def mark_all_as_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> dict:
    """
    すべての通知を既読にする
    """
    count = crud_notification.mark_all_as_read(db, user_id=current_user.id)
    return {"marked_count": count}


@router.delete("/{notification_id}")
def delete_notification(
    *,
    db: Session = Depends(deps.get_db),
    notification_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Notification:
    """
    通知を削除
    """
    notification = crud_notification.get(db, id=notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # 自分の通知のみ削除できる
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    notification = crud_notification.remove(db, id=notification_id)
    return notification
