from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.models.user import User
from app.schemas.report import Report, ReportSummary, ReportGenerate
from app.utils.report_generator import generate_report_data

router = APIRouter()


@router.get("", response_model=List[ReportSummary])
def get_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    report_type: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
) -> List[ReportSummary]:
    """
    レポート一覧を取得

    - skip: スキップ数
    - limit: 取得件数
    - report_type: レポートタイプでフィルタ（optional）
    """
    if report_type:
        reports = crud.crud_report.get_by_type(
            db,
            user_id=current_user.id,
            report_type=report_type,
            skip=skip,
            limit=limit
        )
    else:
        reports = crud.crud_report.get_by_user(
            db,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
    return reports


@router.get("/{report_id}", response_model=Report)
def get_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Report:
    """
    レポート詳細を取得

    - report_id: レポートID
    """
    report = crud.crud_report.get(db, id=report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="レポートが見つかりません"
        )

    # 自分のレポートのみ閲覧可能（管理者・マネージャーは全て閲覧可能）
    if current_user.role == "sales" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このレポートにアクセスする権限がありません"
        )

    return report


@router.post("/generate", response_model=Report)
def generate_report(
    *,
    db: Session = Depends(deps.get_db),
    report_in: ReportGenerate,
    current_user: User = Depends(deps.get_current_user),
) -> Report:
    """
    レポートを生成

    - report_type: レポートタイプ ('monthly', 'weekly', 'custom')
    - period_start: 期間開始日時
    - period_end: 期間終了日時
    - include_charts: チャートを含めるか
    - sales_person_id: 営業担当者ID（営業員は自分のみ、管理者・マネージャーは指定可能）
    """

    # 営業員は自分のレポートのみ生成可能
    target_user_id = current_user.id
    if current_user.role in ["admin", "manager"]:
        if report_in.sales_person_id:
            target_user_id = report_in.sales_person_id
        else:
            # 全体レポート
            target_user_id = current_user.id
    elif report_in.sales_person_id and report_in.sales_person_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="他のユーザーのレポートを生成する権限がありません"
        )

    # 日時パース
    try:
        period_start = datetime.fromisoformat(report_in.period_start.replace('Z', '+00:00'))
        period_end = datetime.fromisoformat(report_in.period_end.replace('Z', '+00:00'))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="日時のフォーマットが正しくありません"
        )

    # レポートデータ生成
    sales_person_id_for_data = None
    if current_user.role == "sales":
        sales_person_id_for_data = current_user.id
    elif report_in.sales_person_id:
        sales_person_id_for_data = report_in.sales_person_id

    report_data = generate_report_data(
        db,
        period_start=period_start,
        period_end=period_end,
        sales_person_id=sales_person_id_for_data
    )

    # タイトル生成
    if report_in.report_type == "monthly":
        title = f"{period_start.strftime('%Y年%m月')} 月次レポート"
    elif report_in.report_type == "weekly":
        title = f"{period_start.strftime('%Y年%m月%d日')}〜{period_end.strftime('%m月%d日')} 週次レポート"
    else:
        title = f"{period_start.strftime('%Y年%m月%d日')}〜{period_end.strftime('%m月%d日')} カスタムレポート"

    if sales_person_id_for_data:
        user = crud.crud_user.get(db, id=sales_person_id_for_data)
        if user:
            title += f" - {user.full_name}"

    # レポート保存
    report = crud.crud_report.create_report(
        db,
        user_id=target_user_id,
        report_type=report_in.report_type,
        period_start=period_start,
        period_end=period_end,
        title=title,
        data=report_data
    )

    return report


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    レポートを削除

    - report_id: レポートID
    """
    report = crud.crud_report.get(db, id=report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="レポートが見つかりません"
        )

    # 自分のレポートのみ削除可能
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このレポートを削除する権限がありません"
        )

    crud.crud_report.remove(db, id=report_id)
    return {"message": "レポートを削除しました"}
