from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.crud import crud_activity
from app.models.user import User
from app.schemas.activity import Activity, ActivityCreate, ActivityUpdate
from app.utils.export import export_to_csv, convert_to_dict_list

router = APIRouter()


@router.get("", response_model=List[Activity])
def read_activities(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> List[Activity]:
    """
    営業活動一覧を取得
    """
    if current_user.role == "sales":
        # 営業担当者は自分の活動のみ
        activities = crud_activity.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        # 管理者・マネージャーは全件
        activities = crud_activity.get_multi(db, skip=skip, limit=limit)
    return activities


@router.post("", response_model=Activity)
def create_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_in: ActivityCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Activity:
    """
    営業活動を作成
    """
    activity = crud_activity.create_with_sales_person(db, obj_in=activity_in, sales_person_id=current_user.id)
    return activity


@router.get("/{activity_id}", response_model=Activity)
def read_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Activity:
    """
    営業活動詳細を取得
    """
    activity = crud_activity.get(db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # 営業担当者は自分の活動のみアクセス可能
    if current_user.role == "sales" and activity.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return activity


@router.put("/{activity_id}", response_model=Activity)
def update_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    activity_in: ActivityUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Activity:
    """
    営業活動を更新
    """
    activity = crud_activity.get(db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # 営業担当者は自分の活動のみ更新可能
    if current_user.role == "sales" and activity.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    activity = crud_activity.update(db, db_obj=activity, obj_in=activity_in)
    return activity


@router.delete("/{activity_id}", response_model=Activity)
def delete_activity(
    *,
    db: Session = Depends(deps.get_db),
    activity_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Activity:
    """
    営業活動を削除
    """
    activity = crud_activity.get(db, id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    # 営業担当者は自分の活動のみ削除可能、管理者は全件削除可能
    if current_user.role == "sales" and activity.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    activity = crud_activity.remove(db, id=activity_id)
    return activity


@router.get("/export/csv")
def export_activities_csv(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    current_user: User = Depends(deps.get_current_user),
) -> StreamingResponse:
    """
    営業活動データをCSV形式でエクスポート
    """
    if current_user.role == "sales":
        # 営業担当者は自分の活動のみ
        activities = crud_activity.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        # 管理者・マネージャーは全件
        activities = crud_activity.get_multi(db, skip=skip, limit=limit)

    # オブジェクトを辞書のリストに変換
    activities_dict = convert_to_dict_list(activities)

    # CSVヘッダーの定義
    headers = [
        "id",
        "activity_date",
        "activity_type",
        "content",
        "result",
        "next_action",
        "customer_id",
        "property_id",
        "deal_id",
        "sales_person_id",
        "location_lat",
        "location_lon",
        "created_at",
        "updated_at"
    ]

    # ファイル名に現在日時を含める
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"activities_{timestamp}.csv"

    return export_to_csv(activities_dict, filename, headers)
