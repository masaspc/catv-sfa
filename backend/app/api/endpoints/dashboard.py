from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any

from app.api import deps
from app.models.user import User
from app.models.activity import Activity
from app.models.deal import Deal
from app.models.contract import Contract
from app.models.daily_report import DailyReport

router = APIRouter()


@router.get("/kpis")
def get_dashboard_kpis(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Dict[str, Any]:
    """
    ダッシュボードKPIを取得
    """
    # 今月の開始日
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    # 営業担当者の場合は自分のデータのみ
    user_filter = (
        Activity.sales_person_id == current_user.id
        if current_user.role == "sales"
        else None
    )

    # 今月の訪問件数
    visit_query = db.query(func.count(Activity.id)).filter(
        Activity.activity_type == "visit",
        Activity.activity_date >= month_start
    )
    if user_filter is not None:
        visit_query = visit_query.filter(user_filter)
    visits_count = visit_query.scalar() or 0

    # 今月の受注件数（actual_close_dateが今月の案件）
    order_query = db.query(func.count(Deal.id)).filter(
        Deal.actual_close_date >= month_start,
        Deal.actual_close_date.isnot(None)
    )
    if current_user.role == "sales":
        order_query = order_query.filter(Deal.sales_person_id == current_user.id)
    orders_count = order_query.scalar() or 0

    # 有効契約数（end_dateが未設定）
    active_contracts_count = db.query(func.count(Contract.id)).filter(
        Contract.end_date.is_(None)
    ).scalar() or 0

    # 今月の営業活動数
    activity_query = db.query(func.count(Activity.id)).filter(
        Activity.activity_date >= month_start
    )
    if user_filter is not None:
        activity_query = activity_query.filter(user_filter)
    activities_count = activity_query.scalar() or 0

    # 進行中の案件数（フェーズがwon/lostでない）
    ongoing_deals_query = db.query(func.count(Deal.id)).filter(
        Deal.phase.notin_(["won", "lost"])
    )
    if current_user.role == "sales":
        ongoing_deals_query = ongoing_deals_query.filter(Deal.sales_person_id == current_user.id)
    ongoing_deals_count = ongoing_deals_query.scalar() or 0

    # 目標達成率（仮で50件を目標とする）
    target_visits = 50
    achievement_rate = round((visits_count / target_visits * 100), 1) if target_visits > 0 else 0

    return {
        "visits_count": visits_count,
        "orders_count": orders_count,
        "active_contracts_count": active_contracts_count,
        "activities_count": activities_count,
        "ongoing_deals_count": ongoing_deals_count,
        "achievement_rate": achievement_rate,
        "period": "current_month",
    }


@router.get("/activities-by-type")
def get_activities_by_type(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Dict[str, int]:
    """
    活動種別ごとの件数を取得
    """
    # 今月の開始日
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    user_filter = (
        Activity.sales_person_id == current_user.id
        if current_user.role == "sales"
        else None
    )

    query = db.query(
        Activity.activity_type,
        func.count(Activity.id).label('count')
    ).filter(
        Activity.activity_date >= month_start
    )

    if user_filter is not None:
        query = query.filter(user_filter)

    results = query.group_by(Activity.activity_type).all()

    return {result.activity_type: result.count for result in results}


@router.get("/deals-by-phase")
def get_deals_by_phase(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Dict[str, int]:
    """
    案件フェーズごとの件数を取得
    """
    user_filter = (
        Deal.sales_person_id == current_user.id
        if current_user.role == "sales"
        else None
    )

    query = db.query(
        Deal.phase,
        func.count(Deal.id).label('count')
    ).filter(
        Deal.phase.isnot(None)
    )

    if user_filter is not None:
        query = query.filter(user_filter)

    results = query.group_by(Deal.phase).all()

    return {result.phase: result.count for result in results}


@router.get("/revenue-trend")
def get_revenue_trend(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    months: int = 6
) -> list:
    """
    売上推移を取得（過去N ヶ月の月別受注金額）

    Args:
        months: 取得する月数（デフォルト: 6ヶ月）

    Returns:
        月別の受注金額リスト
    """
    now = datetime.utcnow()
    data = []

    for i in range(months - 1, -1, -1):
        # 月の開始日と終了日を計算
        if i == 0:
            month_start = datetime(now.year, now.month, 1)
            month_end = now
        else:
            target_date = now - timedelta(days=30 * i)
            month_start = datetime(target_date.year, target_date.month, 1)
            # 次月の1日から1日引く
            if target_date.month == 12:
                month_end = datetime(target_date.year + 1, 1, 1) - timedelta(days=1)
            else:
                month_end = datetime(target_date.year, target_date.month + 1, 1) - timedelta(days=1)

        # 受注金額を集計（actual_close_dateがその月の案件）
        query = db.query(
            func.sum(Deal.estimated_amount).label('total')
        ).filter(
            Deal.actual_close_date >= month_start,
            Deal.actual_close_date <= month_end,
            Deal.phase == "won"
        )

        if current_user.role == "sales":
            query = query.filter(Deal.sales_person_id == current_user.id)

        total = query.scalar() or 0

        data.append({
            "month": month_start.strftime("%Y-%m"),
            "revenue": float(total),
            "label": month_start.strftime("%m月")
        })

    return data


@router.get("/pipeline-value")
def get_pipeline_value(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> list:
    """
    案件パイプライン（フェーズ別の見積金額）を取得

    Returns:
        フェーズ別の見積金額リスト
    """
    user_filter = (
        Deal.sales_person_id == current_user.id
        if current_user.role == "sales"
        else None
    )

    query = db.query(
        Deal.phase,
        func.sum(Deal.estimated_amount).label('total'),
        func.count(Deal.id).label('count')
    ).filter(
        Deal.phase.isnot(None),
        Deal.phase.notin_(["won", "lost"])  # 進行中の案件のみ
    )

    if user_filter is not None:
        query = query.filter(user_filter)

    results = query.group_by(Deal.phase).all()

    # フェーズの順序を定義
    phase_order = {
        "prospecting": 1,
        "qualification": 2,
        "proposal": 3,
        "negotiation": 4,
        "closing": 5
    }

    phase_labels = {
        "prospecting": "見込み客発掘",
        "qualification": "資格確認",
        "proposal": "提案",
        "negotiation": "交渉",
        "closing": "クロージング"
    }

    data = []
    for result in results:
        data.append({
            "phase": result.phase,
            "label": phase_labels.get(result.phase, result.phase),
            "value": float(result.total or 0),
            "count": result.count,
            "order": phase_order.get(result.phase, 99)
        })

    # フェーズ順にソート
    data.sort(key=lambda x: x["order"])

    return data


@router.get("/win-rate-trend")
def get_win_rate_trend(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    months: int = 6
) -> list:
    """
    受注率推移を取得（過去N ヶ月）

    Args:
        months: 取得する月数（デフォルト: 6ヶ月）

    Returns:
        月別の受注率リスト
    """
    now = datetime.utcnow()
    data = []

    for i in range(months - 1, -1, -1):
        # 月の開始日と終了日を計算
        if i == 0:
            month_start = datetime(now.year, now.month, 1)
            month_end = now
        else:
            target_date = now - timedelta(days=30 * i)
            month_start = datetime(target_date.year, target_date.month, 1)
            if target_date.month == 12:
                month_end = datetime(target_date.year + 1, 1, 1) - timedelta(days=1)
            else:
                month_end = datetime(target_date.year, target_date.month + 1, 1) - timedelta(days=1)

        # その月に作成された案件の総数
        total_query = db.query(func.count(Deal.id)).filter(
            Deal.created_at >= month_start,
            Deal.created_at <= month_end
        )

        # その月に受注した案件数
        won_query = db.query(func.count(Deal.id)).filter(
            Deal.created_at >= month_start,
            Deal.created_at <= month_end,
            Deal.phase == "won"
        )

        if current_user.role == "sales":
            total_query = total_query.filter(Deal.sales_person_id == current_user.id)
            won_query = won_query.filter(Deal.sales_person_id == current_user.id)

        total = total_query.scalar() or 0
        won = won_query.scalar() or 0

        win_rate = round((won / total * 100), 1) if total > 0 else 0

        data.append({
            "month": month_start.strftime("%Y-%m"),
            "rate": win_rate,
            "won": won,
            "total": total,
            "label": month_start.strftime("%m月")
        })

    return data
