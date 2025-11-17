"""一括操作APIエンドポイント"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app import crud
from app.models.user import User

router = APIRouter()


class BulkDeleteRequest(BaseModel):
    """一括削除リクエスト"""
    ids: List[int]


class BulkUpdateDealsRequest(BaseModel):
    """案件一括更新リクエスト"""
    ids: List[int]
    phase: Optional[str] = None
    sales_person_id: Optional[int] = None


class BulkUpdateActivitiesRequest(BaseModel):
    """営業活動一括更新リクエスト"""
    ids: List[int]
    activity_type: Optional[str] = None


class BulkOperationResponse(BaseModel):
    """一括操作レスポンス"""
    success: bool
    processed: int
    failed: int
    errors: List[str] = []


# ========== 顧客の一括操作 ==========

@router.post("/customers/delete", response_model=BulkOperationResponse)
def bulk_delete_customers(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkDeleteRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    顧客を一括削除

    管理者・マネージャーのみ実行可能
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    processed = 0
    failed = 0
    errors = []

    for customer_id in request.ids:
        try:
            customer = crud.crud_customer.get(db, id=customer_id)
            if not customer:
                errors.append(f"顧客ID {customer_id} が見つかりません")
                failed += 1
                continue

            crud.crud_customer.remove(db, id=customer_id)
            processed += 1
        except Exception as e:
            errors.append(f"顧客ID {customer_id} の削除エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )


# ========== 案件の一括操作 ==========

@router.post("/deals/delete", response_model=BulkOperationResponse)
def bulk_delete_deals(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkDeleteRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    案件を一括削除

    管理者・マネージャーは全て削除可能
    営業担当者は自分の案件のみ削除可能
    """
    processed = 0
    failed = 0
    errors = []

    for deal_id in request.ids:
        try:
            deal = crud.crud_deal.get(db, id=deal_id)
            if not deal:
                errors.append(f"案件ID {deal_id} が見つかりません")
                failed += 1
                continue

            # 権限チェック
            if current_user.role == "sales" and deal.sales_person_id != current_user.id:
                errors.append(f"案件ID {deal_id} を削除する権限がありません")
                failed += 1
                continue

            crud.crud_deal.remove(db, id=deal_id)
            processed += 1
        except Exception as e:
            errors.append(f"案件ID {deal_id} の削除エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )


@router.post("/deals/update", response_model=BulkOperationResponse)
def bulk_update_deals(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkUpdateDealsRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    案件を一括更新

    更新可能項目:
    - phase: フェーズ
    - sales_person_id: 営業担当者

    管理者・マネージャーは全て更新可能
    営業担当者は自分の案件のみ更新可能
    """
    if not request.phase and not request.sales_person_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="更新する項目を指定してください"
        )

    processed = 0
    failed = 0
    errors = []

    for deal_id in request.ids:
        try:
            deal = crud.crud_deal.get(db, id=deal_id)
            if not deal:
                errors.append(f"案件ID {deal_id} が見つかりません")
                failed += 1
                continue

            # 権限チェック
            if current_user.role == "sales" and deal.sales_person_id != current_user.id:
                errors.append(f"案件ID {deal_id} を更新する権限がありません")
                failed += 1
                continue

            # 更新データ作成
            update_data = {}
            if request.phase:
                update_data['phase'] = request.phase
            if request.sales_person_id:
                update_data['sales_person_id'] = request.sales_person_id

            crud.crud_deal.update(db, db_obj=deal, obj_in=update_data)
            processed += 1
        except Exception as e:
            errors.append(f"案件ID {deal_id} の更新エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )


# ========== 営業活動の一括操作 ==========

@router.post("/activities/delete", response_model=BulkOperationResponse)
def bulk_delete_activities(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkDeleteRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    営業活動を一括削除

    管理者・マネージャーは全て削除可能
    営業担当者は自分の活動のみ削除可能
    """
    processed = 0
    failed = 0
    errors = []

    for activity_id in request.ids:
        try:
            activity = crud.crud_activity.get(db, id=activity_id)
            if not activity:
                errors.append(f"営業活動ID {activity_id} が見つかりません")
                failed += 1
                continue

            # 権限チェック
            if current_user.role == "sales" and activity.sales_person_id != current_user.id:
                errors.append(f"営業活動ID {activity_id} を削除する権限がありません")
                failed += 1
                continue

            crud.crud_activity.remove(db, id=activity_id)
            processed += 1
        except Exception as e:
            errors.append(f"営業活動ID {activity_id} の削除エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )


@router.post("/activities/update", response_model=BulkOperationResponse)
def bulk_update_activities(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkUpdateActivitiesRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    営業活動を一括更新

    更新可能項目:
    - activity_type: 活動種別

    管理者・マネージャーは全て更新可能
    営業担当者は自分の活動のみ更新可能
    """
    if not request.activity_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="更新する項目を指定してください"
        )

    processed = 0
    failed = 0
    errors = []

    for activity_id in request.ids:
        try:
            activity = crud.crud_activity.get(db, id=activity_id)
            if not activity:
                errors.append(f"営業活動ID {activity_id} が見つかりません")
                failed += 1
                continue

            # 権限チェック
            if current_user.role == "sales" and activity.sales_person_id != current_user.id:
                errors.append(f"営業活動ID {activity_id} を更新する権限がありません")
                failed += 1
                continue

            # 更新
            update_data = {'activity_type': request.activity_type}
            crud.crud_activity.update(db, db_obj=activity, obj_in=update_data)
            processed += 1
        except Exception as e:
            errors.append(f"営業活動ID {activity_id} の更新エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )


# ========== 日報の一括操作 ==========

@router.post("/daily-reports/delete", response_model=BulkOperationResponse)
def bulk_delete_daily_reports(
    *,
    db: Session = Depends(deps.get_db),
    request: BulkDeleteRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    日報を一括削除

    管理者・マネージャーは全て削除可能
    営業担当者は自分の日報のみ削除可能
    """
    processed = 0
    failed = 0
    errors = []

    for report_id in request.ids:
        try:
            report = crud.crud_daily_report.get(db, id=report_id)
            if not report:
                errors.append(f"日報ID {report_id} が見つかりません")
                failed += 1
                continue

            # 権限チェック
            if current_user.role == "sales" and report.sales_person_id != current_user.id:
                errors.append(f"日報ID {report_id} を削除する権限がありません")
                failed += 1
                continue

            crud.crud_daily_report.remove(db, id=report_id)
            processed += 1
        except Exception as e:
            errors.append(f"日報ID {report_id} の削除エラー: {str(e)}")
            failed += 1

    return BulkOperationResponse(
        success=True,
        processed=processed,
        failed=failed,
        errors=errors
    )
