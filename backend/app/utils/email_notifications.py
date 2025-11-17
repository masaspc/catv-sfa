"""メール通知ユーティリティ"""
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.core.email import email_service
from app.models.user import User
from app.models.deal import Deal
from app.models.activity import Activity
from app.models.contract import Contract


def send_deal_deadline_notification(
    db: Session,
    deal: Deal,
    user: User,
    days_until_deadline: int
) -> bool:
    """
    案件期限通知メールを送信

    Args:
        db: データベースセッション
        deal: 案件
        user: ユーザー
        days_until_deadline: 期限までの日数

    Returns:
        送信成功の場合True
    """
    if not user.email:
        return False

    context = {
        'title': '案件期限のお知らせ',
        'message': f'''
            {user.full_name} 様

            案件「{deal.deal_name}」の受注予定日まであと {days_until_deadline} 日です。

            案件詳細:
            - 案件名: {deal.deal_name}
            - フェーズ: {deal.phase}
            - 受注予定日: {deal.expected_close_date.strftime('%Y年%m月%d日') if deal.expected_close_date else '未設定'}
            - 見積金額: ¥{deal.estimated_amount:,} 円

            引き続きフォローアップをお願いします。
        ''',
        'action_url': f'/deals/{deal.id}',
        'action_text': '案件を確認'
    }

    html = email_service.render_template('deal_deadline', context)
    subject = f'【CATV SFA】案件期限通知: {deal.deal_name}'

    return email_service.send_email(
        to_email=user.email,
        subject=subject,
        body_html=html
    )


def send_activity_follow_up_notification(
    db: Session,
    activity: Activity,
    user: User
) -> bool:
    """
    営業活動フォローアップ通知メールを送信

    Args:
        db: データベースセッション
        activity: 営業活動
        user: ユーザー

    Returns:
        送信成功の場合True
    """
    if not user.email:
        return False

    context = {
        'title': '営業活動フォローアップのお知らせ',
        'message': f'''
            {user.full_name} 様

            次のアクションの実施日が近づいています。

            活動詳細:
            - 活動種別: {activity.activity_type}
            - 次のアクション: {activity.next_action or '未設定'}
            - 実施予定日: {activity.next_action_date.strftime('%Y年%m月%d日') if activity.next_action_date else '未設定'}

            対応をお願いします。
        ''',
        'action_url': f'/activities/{activity.id}',
        'action_text': '活動を確認'
    }

    html = email_service.render_template('activity_follow_up', context)
    subject = f'【CATV SFA】フォローアップ通知: {activity.next_action or "営業活動"}'

    return email_service.send_email(
        to_email=user.email,
        subject=subject,
        body_html=html
    )


def send_daily_report_reminder(
    db: Session,
    user: User,
    date: datetime
) -> bool:
    """
    日報未提出リマインダーメールを送信

    Args:
        db: データベースセッション
        user: ユーザー
        date: 対象日付

    Returns:
        送信成功の場合True
    """
    if not user.email:
        return False

    context = {
        'title': '日報提出のリマインド',
        'message': f'''
            {user.full_name} 様

            {date.strftime('%Y年%m月%d日')} の日報がまだ提出されていません。

            日報の提出をお願いします。
        ''',
        'action_url': '/daily-reports',
        'action_text': '日報を提出'
    }

    html = email_service.render_template('daily_report_reminder', context)
    subject = f'【CATV SFA】日報提出リマインド: {date.strftime("%Y年%m月%d日")}'

    return email_service.send_email(
        to_email=user.email,
        subject=subject,
        body_html=html
    )


def send_contract_renewal_notification(
    db: Session,
    contract: Contract,
    user: User,
    days_until_expiry: int
) -> bool:
    """
    契約更新通知メールを送信

    Args:
        db: データベースセッション
        contract: 契約
        user: ユーザー
        days_until_expiry: 期限までの日数

    Returns:
        送信成功の場合True
    """
    if not user.email:
        return False

    context = {
        'title': '契約更新のお知らせ',
        'message': f'''
            {user.full_name} 様

            契約「{contract.contract_number}」の更新期限まであと {days_until_expiry} 日です。

            契約詳細:
            - 契約番号: {contract.contract_number}
            - 契約金額: ¥{contract.contract_amount:,} 円
            - 更新日: {contract.renewal_date.strftime('%Y年%m月%d日') if contract.renewal_date else '未設定'}

            更新手続きの準備をお願いします。
        ''',
        'action_url': f'/contracts/{contract.id}',
        'action_text': '契約を確認'
    }

    html = email_service.render_template('contract_renewal', context)
    subject = f'【CATV SFA】契約更新通知: {contract.contract_number}'

    return email_service.send_email(
        to_email=user.email,
        subject=subject,
        body_html=html
    )


def send_weekly_report_email(
    db: Session,
    user: User,
    report_data: dict
) -> bool:
    """
    週次レポートメールを送信

    Args:
        db: データベースセッション
        user: ユーザー
        report_data: レポートデータ

    Returns:
        送信成功の場合True
    """
    if not user.email:
        return False

    summary = report_data.get('summary', {})

    context = {
        'title': '週次レポート',
        'message': f'''
            {user.full_name} 様

            今週の営業実績をお知らせします。

            サマリー:
            - 総案件数: {summary.get('total_deals', 0)} 件
            - 受注件数: {summary.get('won_deals', 0)} 件
            - 受注率: {summary.get('win_rate', 0):.1f}%
            - 営業活動数: {summary.get('total_activities', 0)} 件
            - 1日平均活動数: {summary.get('avg_activities_per_day', 0):.1f} 件

            引き続き頑張りましょう！
        ''',
        'action_url': '/reports',
        'action_text': '詳細レポートを見る'
    }

    html = email_service.render_template('weekly_report', context)
    subject = f'【CATV SFA】週次レポート: {summary.get("period_start", "")} - {summary.get("period_end", "")}'

    return email_service.send_email(
        to_email=user.email,
        subject=subject,
        body_html=html
    )
