from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.report import Report
from app.schemas.report import ReportGenerate


class CRUDReport(CRUDBase[Report, ReportGenerate, ReportGenerate]):
    """レポートCRUD操作"""

    def get_by_user(
        self,
        db: Session,
        *,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Report]:
        """
        ユーザーのレポート一覧を取得

        Args:
            db: データベースセッション
            user_id: ユーザーID
            skip: スキップ数
            limit: 取得件数

        Returns:
            レポート一覧
        """
        return (
            db.query(self.model)
            .filter(Report.user_id == user_id)
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_type(
        self,
        db: Session,
        *,
        user_id: int,
        report_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Report]:
        """
        レポートタイプ別に取得

        Args:
            db: データベースセッション
            user_id: ユーザーID
            report_type: レポートタイプ
            skip: スキップ数
            limit: 取得件数

        Returns:
            レポート一覧
        """
        return (
            db.query(self.model)
            .filter(
                Report.user_id == user_id,
                Report.report_type == report_type
            )
            .order_by(Report.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_report(
        self,
        db: Session,
        *,
        user_id: int,
        report_type: str,
        period_start: datetime,
        period_end: datetime,
        title: str,
        data: dict,
        description: Optional[str] = None
    ) -> Report:
        """
        レポートを作成

        Args:
            db: データベースセッション
            user_id: ユーザーID
            report_type: レポートタイプ
            period_start: 期間開始
            period_end: 期間終了
            title: タイトル
            data: レポートデータ
            description: 説明

        Returns:
            作成されたレポート
        """
        db_obj = Report(
            user_id=user_id,
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            title=title,
            description=description,
            data=data
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_report = CRUDReport(Report)
