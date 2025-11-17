from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_daily_report
from app.models.user import User
from app.schemas.daily_report import DailyReport, DailyReportCreate, DailyReportUpdate
from app.utils.export import export_to_csv, convert_to_dict_list

router = APIRouter()


@router.get("", response_model=List[DailyReport])
def read_daily_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> List[DailyReport]:
    """
    日報一覧を取得
    """
    if current_user.role == "sales":
        # 営業担当者は自分の日報のみ
        daily_reports = crud_daily_report.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        # 管理者・マネージャーは全件
        daily_reports = crud_daily_report.get_multi(db, skip=skip, limit=limit)
    return daily_reports


@router.post("", response_model=DailyReport)
def create_daily_report(
    *,
    db: Session = Depends(deps.get_db),
    daily_report_in: DailyReportCreate,
    current_user: User = Depends(deps.get_current_user),
) -> DailyReport:
    """
    日報を作成
    """
    # 同じ日付の日報が既に存在しないかチェック
    existing = crud_daily_report.get_by_date(db, sales_person_id=current_user.id, report_date=daily_report_in.report_date)
    if existing:
        raise HTTPException(status_code=400, detail="Daily report for this date already exists")

    daily_report = crud_daily_report.create_with_sales_person(db, obj_in=daily_report_in, sales_person_id=current_user.id)
    return daily_report


@router.get("/by-date", response_model=DailyReport)
def read_daily_report_by_date(
    *,
    db: Session = Depends(deps.get_db),
    report_date: date,
    current_user: User = Depends(deps.get_current_user),
) -> DailyReport:
    """
    指定日の日報を取得
    """
    daily_report = crud_daily_report.get_by_date(db, sales_person_id=current_user.id, report_date=report_date)
    if not daily_report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    return daily_report


@router.get("/{daily_report_id}", response_model=DailyReport)
def read_daily_report(
    *,
    db: Session = Depends(deps.get_db),
    daily_report_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> DailyReport:
    """
    日報詳細を取得
    """
    daily_report = crud_daily_report.get(db, id=daily_report_id)
    if not daily_report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    # 営業担当者は自分の日報のみアクセス可能
    if current_user.role == "sales" and daily_report.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return daily_report


@router.put("/{daily_report_id}", response_model=DailyReport)
def update_daily_report(
    *,
    db: Session = Depends(deps.get_db),
    daily_report_id: int,
    daily_report_in: DailyReportUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> DailyReport:
    """
    日報を更新
    """
    daily_report = crud_daily_report.get(db, id=daily_report_id)
    if not daily_report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    # 営業担当者は自分の日報のみ更新可能
    if current_user.role == "sales" and daily_report.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    daily_report = crud_daily_report.update(db, db_obj=daily_report, obj_in=daily_report_in)
    return daily_report


@router.delete("/{daily_report_id}", response_model=DailyReport)
def delete_daily_report(
    *,
    db: Session = Depends(deps.get_db),
    daily_report_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> DailyReport:
    """
    日報を削除（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    daily_report = crud_daily_report.get(db, id=daily_report_id)
    if not daily_report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    daily_report = crud_daily_report.remove(db, id=daily_report_id)
    return daily_report



@router.get("/export/csv")
def export_daily_reports_csv(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    current_user: User = Depends(deps.get_current_user),
) -> StreamingResponse:
    """
    日報データをCSV形式でエクスポート
    """
    if current_user.role == "sales":
        daily_reports = crud_daily_report.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        daily_reports = crud_daily_report.get_multi(db, skip=skip, limit=limit)

    daily_reports_dict = convert_to_dict_list(daily_reports)

    headers = [
        "id", "report_date", "start_time", "end_time", "work_hours",
        "visits_count", "new_contacts_count", "meetings_count", "orders_count",
        "content", "issues", "tomorrow_plan", "sales_person_id",
        "created_at", "updated_at"
    ]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"daily_reports_{timestamp}.csv"

    return export_to_csv(daily_reports_dict, filename, headers)

