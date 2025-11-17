"""レポート生成ユーティリティ"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.deal import Deal
from app.models.activity import Activity
from app.models.contract import Contract
from app.models.daily_report import DailyReport
from app.models.user import User


def generate_report_data(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    指定期間のレポートデータを生成

    Args:
        db: データベースセッション
        period_start: 期間開始日時
        period_end: 期間終了日時
        sales_person_id: 営業担当者ID（Noneの場合は全体）

    Returns:
        レポートデータ（辞書形式）
    """

    # 基本フィルタ
    base_filter = and_(
        Deal.created_at >= period_start,
        Deal.created_at <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Deal.sales_person_id == sales_person_id)

    # サマリーデータ
    summary = _generate_summary(db, period_start, period_end, sales_person_id)

    # 案件データ
    deals_by_phase = _get_deals_by_phase(db, period_start, period_end, sales_person_id)
    deals_by_type = _get_deals_by_type(db, period_start, period_end, sales_person_id)

    # 収益メトリクス
    revenue_metrics = _get_revenue_metrics(db, period_start, period_end, sales_person_id)

    # 活動メトリクス
    activity_metrics = _get_activity_metrics(db, period_start, period_end, sales_person_id)

    # トップパフォーマー（全体レポートの場合のみ）
    top_performers = []
    if not sales_person_id:
        top_performers = _get_top_performers(db, period_start, period_end)

    # 契約メトリクス
    contract_metrics = _get_contract_metrics(db, period_start, period_end, sales_person_id)

    return {
        "summary": summary,
        "deals_by_phase": deals_by_phase,
        "deals_by_type": deals_by_type,
        "revenue_metrics": revenue_metrics,
        "activity_metrics": activity_metrics,
        "top_performers": top_performers,
        "contract_metrics": contract_metrics
    }


def _generate_summary(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, Any]:
    """サマリーデータを生成"""

    base_filter = and_(
        Deal.created_at >= period_start,
        Deal.created_at <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Deal.sales_person_id == sales_person_id)

    total_deals = db.query(Deal).filter(base_filter).count()
    won_deals = db.query(Deal).filter(base_filter, Deal.phase == "won").count()
    lost_deals = db.query(Deal).filter(base_filter, Deal.phase == "lost").count()

    # 活動数
    activity_filter = and_(
        Activity.activity_date >= period_start,
        Activity.activity_date <= period_end
    )
    if sales_person_id:
        activity_filter = and_(activity_filter, Activity.sales_person_id == sales_person_id)

    total_activities = db.query(Activity).filter(activity_filter).count()

    # 日報提出数
    report_filter = and_(
        DailyReport.report_date >= period_start,
        DailyReport.report_date <= period_end
    )
    if sales_person_id:
        report_filter = and_(report_filter, DailyReport.sales_person_id == sales_person_id)

    total_daily_reports = db.query(DailyReport).filter(report_filter).count()

    return {
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat(),
        "total_deals": total_deals,
        "won_deals": won_deals,
        "lost_deals": lost_deals,
        "win_rate": round(won_deals / total_deals * 100, 2) if total_deals > 0 else 0,
        "total_activities": total_activities,
        "total_daily_reports": total_daily_reports,
        "avg_activities_per_day": round(total_activities / ((period_end - period_start).days or 1), 2)
    }


def _get_deals_by_phase(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, int]:
    """フェーズ別案件数を取得"""

    base_filter = and_(
        Deal.created_at >= period_start,
        Deal.created_at <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Deal.sales_person_id == sales_person_id)

    results = db.query(
        Deal.phase,
        func.count(Deal.id).label('count')
    ).filter(base_filter).group_by(Deal.phase).all()

    return {phase: count for phase, count in results}


def _get_deals_by_type(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, int]:
    """案件種別別案件数を取得"""

    base_filter = and_(
        Deal.created_at >= period_start,
        Deal.created_at <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Deal.sales_person_id == sales_person_id)

    results = db.query(
        Deal.deal_type,
        func.count(Deal.id).label('count')
    ).filter(base_filter).group_by(Deal.deal_type).all()

    return {deal_type: count for deal_type, count in results}


def _get_revenue_metrics(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, Any]:
    """収益メトリクスを取得"""

    base_filter = and_(
        Deal.created_at >= period_start,
        Deal.created_at <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Deal.sales_person_id == sales_person_id)

    # 総見積金額
    total_estimated = db.query(
        func.sum(Deal.estimated_amount)
    ).filter(base_filter).scalar() or 0

    # 受注金額（phaseがwonの案件）
    won_amount = db.query(
        func.sum(Deal.estimated_amount)
    ).filter(base_filter, Deal.phase == "won").scalar() or 0

    # 見込み収益（受注確度を考慮）
    forecast_revenue = db.query(
        func.sum(Deal.estimated_amount * Deal.probability / 100.0)
    ).filter(
        base_filter,
        Deal.phase.notin_(["won", "lost"])
    ).scalar() or 0

    return {
        "total_estimated_amount": float(total_estimated),
        "won_amount": float(won_amount),
        "forecast_revenue": float(forecast_revenue),
        "total_revenue": float(won_amount + forecast_revenue)
    }


def _get_activity_metrics(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, Any]:
    """活動メトリクスを取得"""

    activity_filter = and_(
        Activity.activity_date >= period_start,
        Activity.activity_date <= period_end
    )
    if sales_person_id:
        activity_filter = and_(activity_filter, Activity.sales_person_id == sales_person_id)

    # 活動種別ごとの集計
    results = db.query(
        Activity.activity_type,
        func.count(Activity.id).label('count')
    ).filter(activity_filter).group_by(Activity.activity_type).all()

    by_type = {activity_type: count for activity_type, count in results}

    total_activities = sum(by_type.values())

    return {
        "total_activities": total_activities,
        "by_type": by_type
    }


def _get_top_performers(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """トップパフォーマー（受注金額順）を取得"""

    results = db.query(
        User.id,
        User.full_name,
        func.count(Deal.id).label('won_deals'),
        func.sum(Deal.estimated_amount).label('won_amount')
    ).join(
        Deal, Deal.sales_person_id == User.id
    ).filter(
        and_(
            Deal.phase == "won",
            Deal.created_at >= period_start,
            Deal.created_at <= period_end
        )
    ).group_by(
        User.id, User.full_name
    ).order_by(
        func.sum(Deal.estimated_amount).desc()
    ).limit(limit).all()

    return [
        {
            "user_id": user_id,
            "full_name": full_name,
            "won_deals": won_deals,
            "won_amount": float(won_amount or 0)
        }
        for user_id, full_name, won_deals, won_amount in results
    ]


def _get_contract_metrics(
    db: Session,
    period_start: datetime,
    period_end: datetime,
    sales_person_id: Optional[int]
) -> Dict[str, Any]:
    """契約メトリクスを取得"""

    base_filter = and_(
        Contract.contract_date >= period_start,
        Contract.contract_date <= period_end
    )
    if sales_person_id:
        base_filter = and_(base_filter, Contract.sales_person_id == sales_person_id)

    total_contracts = db.query(Contract).filter(base_filter).count()

    # ステータス別集計
    status_results = db.query(
        Contract.status,
        func.count(Contract.id).label('count')
    ).filter(base_filter).group_by(Contract.status).all()

    by_status = {status: count for status, count in status_results}

    # 契約金額合計
    total_amount = db.query(
        func.sum(Contract.contract_amount)
    ).filter(base_filter).scalar() or 0

    return {
        "total_contracts": total_contracts,
        "by_status": by_status,
        "total_contract_amount": float(total_amount)
    }
