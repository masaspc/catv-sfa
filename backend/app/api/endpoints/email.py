"""メール連携APIエンドポイント"""
from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app import crud
from app.api import deps
from app.models.user import User
from app.models.deal import Deal
from app.models.activity import Activity
from app.models.contract import Contract
from app.utils.email_notifications import (
    send_deal_deadline_notification,
    send_activity_follow_up_notification,
    send_daily_report_reminder,
    send_contract_renewal_notification,
    send_weekly_report_email,
)
from app.utils.report_generator import generate_report_data

router = APIRouter()


class EmailTest(BaseModel):
    """テストメール送信リクエスト"""
    to_email: EmailStr
    subject: str
    message: str


class NotificationSettings(BaseModel):
    """通知設定"""
    deal_deadline_enabled: bool = True
    deal_deadline_days: int = 3  # 何日前に通知するか
    activity_follow_up_enabled: bool = True
    activity_follow_up_days: int = 1
    daily_report_reminder_enabled: bool = True
    contract_renewal_enabled: bool = True
    contract_renewal_days: int = 30
    weekly_report_enabled: bool = True


@router.post("/test")
def send_test_email(
    *,
    db: Session = Depends(deps.get_db),
    email_data: EmailTest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    テストメールを送信

    - to_email: 送信先メールアドレス
    - subject: 件名
    - message: メッセージ
    """
    from app.core.email import email_service

    context = {
        'title': email_data.subject,
        'message': email_data.message,
        'action_url': '',
        'action_text': ''
    }

    html = email_service.render_template('default', context)

    success = email_service.send_email(
        to_email=email_data.to_email,
        subject=email_data.subject,
        body_html=html
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="メール送信に失敗しました"
        )

    return {"message": "テストメールを送信しました"}


@router.post("/notifications/deal-deadlines")
def send_deal_deadline_notifications(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    案件期限通知を一括送信

    期限が近い案件について、担当者にメール通知を送信します。
    管理者・マネージャーのみ実行可能。
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # 3日以内に期限が来る案件を取得
    target_date = datetime.now() + timedelta(days=3)
    deals = db.query(Deal).filter(
        Deal.expected_close_date <= target_date,
        Deal.expected_close_date >= datetime.now(),
        Deal.phase.notin_(["won", "lost"])
    ).all()

    sent_count = 0
    for deal in deals:
        if deal.sales_person_id:
            user = crud.crud_user.get(db, id=deal.sales_person_id)
            if user:
                days_until = (deal.expected_close_date - datetime.now()).days
                if send_deal_deadline_notification(db, deal, user, days_until):
                    sent_count += 1

    return {
        "message": f"{sent_count} 件の通知メールを送信しました",
        "sent_count": sent_count,
        "total_deals": len(deals)
    }


@router.post("/notifications/activity-follow-ups")
def send_activity_follow_up_notifications(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    営業活動フォローアップ通知を一括送信

    次のアクション実施日が近い活動について、担当者にメール通知を送信します。
    管理者・マネージャーのみ実行可能。
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # 明日までに次のアクションがある活動を取得
    target_date = datetime.now() + timedelta(days=1)
    activities = db.query(Activity).filter(
        Activity.next_action_date <= target_date,
        Activity.next_action_date >= datetime.now(),
        Activity.next_action.isnot(None)
    ).all()

    sent_count = 0
    for activity in activities:
        if activity.sales_person_id:
            user = crud.crud_user.get(db, id=activity.sales_person_id)
            if user:
                if send_activity_follow_up_notification(db, activity, user):
                    sent_count += 1

    return {
        "message": f"{sent_count} 件の通知メールを送信しました",
        "sent_count": sent_count,
        "total_activities": len(activities)
    }


@router.post("/notifications/daily-report-reminders")
def send_daily_report_reminders(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    日報未提出リマインダーを一括送信

    前日の日報が未提出のユーザーにメール通知を送信します。
    管理者・マネージャーのみ実行可能。
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    from app.models.daily_report import DailyReport

    # 前日の日付
    yesterday = datetime.now() - timedelta(days=1)
    yesterday_date = yesterday.date()

    # 営業担当者全員を取得
    users = db.query(User).filter(
        User.role == "sales",
        User.is_active == True
    ).all()

    sent_count = 0
    for user in users:
        # 前日の日報が存在するかチェック
        report = db.query(DailyReport).filter(
            DailyReport.sales_person_id == user.id,
            DailyReport.report_date == yesterday_date
        ).first()

        if not report:
            # 日報が未提出の場合、リマインダー送信
            if send_daily_report_reminder(db, user, yesterday):
                sent_count += 1

    return {
        "message": f"{sent_count} 件のリマインダーメールを送信しました",
        "sent_count": sent_count,
        "total_users": len(users)
    }


@router.post("/notifications/contract-renewals")
def send_contract_renewal_notifications(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    契約更新通知を一括送信

    更新期限が近い契約について、担当者にメール通知を送信します。
    管理者・マネージャーのみ実行可能。
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # 30日以内に更新期限が来る契約を取得
    target_date = datetime.now() + timedelta(days=30)
    contracts = db.query(Contract).filter(
        Contract.renewal_date <= target_date,
        Contract.renewal_date >= datetime.now(),
        Contract.status == "active"
    ).all()

    sent_count = 0
    for contract in contracts:
        if contract.sales_person_id:
            user = crud.crud_user.get(db, id=contract.sales_person_id)
            if user:
                days_until = (contract.renewal_date - datetime.now()).days
                if send_contract_renewal_notification(db, contract, user, days_until):
                    sent_count += 1

    return {
        "message": f"{sent_count} 件の通知メールを送信しました",
        "sent_count": sent_count,
        "total_contracts": len(contracts)
    }


@router.post("/notifications/weekly-reports")
def send_weekly_reports(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    週次レポートを一括送信

    全営業担当者に週次レポートをメール送信します。
    管理者・マネージャーのみ実行可能。
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # 今週の期間を計算
    now = datetime.now()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    # 営業担当者全員を取得
    users = db.query(User).filter(
        User.role == "sales",
        User.is_active == True
    ).all()

    sent_count = 0
    for user in users:
        # 個人の週次レポートデータを生成
        report_data = generate_report_data(
            db,
            period_start=start_of_week,
            period_end=end_of_week,
            sales_person_id=user.id
        )

        if send_weekly_report_email(db, user, report_data):
            sent_count += 1

    return {
        "message": f"{sent_count} 件の週次レポートを送信しました",
        "sent_count": sent_count,
        "total_users": len(users)
    }
