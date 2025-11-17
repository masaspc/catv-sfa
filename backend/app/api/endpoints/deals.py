from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.crud import crud_deal
from app.models.user import User
from app.schemas.deal import Deal, DealCreate, DealUpdate
from app.utils.export import export_to_csv, convert_to_dict_list

router = APIRouter()


@router.get("", response_model=List[Deal])
def read_deals(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> List[Deal]:
    """
    案件一覧を取得
    """
    if current_user.role == "sales":
        # 営業担当者は自分の案件のみ
        deals = crud_deal.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        # 管理者・マネージャーは全件
        deals = crud_deal.get_multi(db, skip=skip, limit=limit)
    return deals


@router.post("", response_model=Deal)
def create_deal(
    *,
    db: Session = Depends(deps.get_db),
    deal_in: DealCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Deal:
    """
    案件を作成
    """
    deal = crud_deal.create_with_sales_person(db, obj_in=deal_in, sales_person_id=current_user.id)
    return deal


@router.get("/search", response_model=List[Deal])
def search_deals(
    *,
    db: Session = Depends(deps.get_db),
    query: str,
    current_user: User = Depends(deps.get_current_user),
) -> List[Deal]:
    """
    案件を検索
    """
    deals = crud_deal.search(db, query=query)

    # 営業担当者は自分の案件のみフィルター
    if current_user.role == "sales":
        deals = [d for d in deals if d.sales_person_id == current_user.id]

    return deals


@router.get("/{deal_id}", response_model=Deal)
def read_deal(
    *,
    db: Session = Depends(deps.get_db),
    deal_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Deal:
    """
    案件詳細を取得
    """
    deal = crud_deal.get(db, id=deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # 営業担当者は自分の案件のみアクセス可能
    if current_user.role == "sales" and deal.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return deal


@router.put("/{deal_id}", response_model=Deal)
def update_deal(
    *,
    db: Session = Depends(deps.get_db),
    deal_id: int,
    deal_in: DealUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Deal:
    """
    案件を更新
    """
    deal = crud_deal.get(db, id=deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # 営業担当者は自分の案件のみ更新可能
    if current_user.role == "sales" and deal.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deal = crud_deal.update(db, db_obj=deal, obj_in=deal_in)
    return deal


@router.delete("/{deal_id}", response_model=Deal)
def delete_deal(
    *,
    db: Session = Depends(deps.get_db),
    deal_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Deal:
    """
    案件を削除（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    deal = crud_deal.get(db, id=deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    deal = crud_deal.remove(db, id=deal_id)
    return deal


@router.get("/export/csv")
def export_deals_csv(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    current_user: User = Depends(deps.get_current_user),
) -> StreamingResponse:
    """
    案件データをCSV形式でエクスポート
    """
    if current_user.role == "sales":
        # 営業担当者は自分の案件のみ
        deals = crud_deal.get_by_sales_person(db, sales_person_id=current_user.id, skip=skip, limit=limit)
    else:
        # 管理者・マネージャーは全件
        deals = crud_deal.get_multi(db, skip=skip, limit=limit)

    # オブジェクトを辞書のリストに変換
    deals_dict = convert_to_dict_list(deals)

    # CSVヘッダーの定義
    headers = [
        "id",
        "deal_name",
        "deal_type",
        "estimated_amount",
        "probability",
        "phase",
        "expected_close_date",
        "actual_close_date",
        "lost_reason",
        "customer_id",
        "property_id",
        "sales_person_id",
        "created_at",
        "updated_at"
    ]

    # ファイル名に現在日時を含める
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"deals_{timestamp}.csv"

    return export_to_csv(deals_dict, filename, headers)
