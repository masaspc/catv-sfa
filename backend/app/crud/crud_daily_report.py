from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.daily_report import DailyReport
from app.schemas.daily_report import DailyReportCreate, DailyReportUpdate


class CRUDDailyReport(CRUDBase[DailyReport, DailyReportCreate, DailyReportUpdate]):
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[DailyReport]:
        """日報一覧を取得（日付降順）"""
        return db.query(DailyReport).order_by(DailyReport.report_date.desc()).offset(skip).limit(limit).all()

    def get_by_sales_person(
        self, db: Session, *, sales_person_id: int, skip: int = 0, limit: int = 100
    ) -> List[DailyReport]:
        """担当営業員の日報を取得"""
        return db.query(DailyReport).filter(
            DailyReport.sales_person_id == sales_person_id
        ).order_by(DailyReport.report_date.desc()).offset(skip).limit(limit).all()

    def get_by_date(
        self, db: Session, *, sales_person_id: int, report_date: date
    ) -> Optional[DailyReport]:
        """指定日の日報を取得"""
        return db.query(DailyReport).filter(
            DailyReport.sales_person_id == sales_person_id,
            DailyReport.report_date == report_date
        ).first()

    def create_with_sales_person(
        self, db: Session, *, obj_in: DailyReportCreate, sales_person_id: int
    ) -> DailyReport:
        """日報を作成（営業員IDを設定）"""
        db_obj = DailyReport(
            **obj_in.model_dump(),
            sales_person_id=sales_person_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_daily_report = CRUDDailyReport(DailyReport)
