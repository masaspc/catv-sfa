from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.crud import crud_property
from app.models.user import User as UserModel
from app.schemas.property import Property, PropertyCreate, PropertyUpdate, PropertyList

router = APIRouter()


@router.get("/", response_model=PropertyList)
def read_properties(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅一覧取得
    """
    # 営業員は自分の担当物件のみ、管理者は全て
    if current_user.role == "sales":
        properties = crud_property.get_by_sales_person(
            db, sales_person_id=current_user.id, skip=skip, limit=limit
        )
    else:
        properties = crud_property.get_multi(db, skip=skip, limit=limit)

    total = crud_property.count(db)
    return {"total": total, "items": properties}


@router.post("/", response_model=Property)
def create_property(
    *,
    db: Session = Depends(get_db),
    property_in: PropertyCreate,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅新規作成
    """
    # 担当営業員が指定されていない場合は作成者を設定
    if not property_in.sales_person_id:
        property_in.sales_person_id = current_user.id

    property_obj = crud_property.create(db, obj_in=property_in)
    return property_obj


@router.get("/search", response_model=List[Property])
def search_properties(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅検索
    """
    properties = crud_property.search(db, query=query, skip=skip, limit=limit)
    return properties


@router.get("/{property_id}", response_model=Property)
def read_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅詳細取得
    """
    property_obj = crud_property.get(db, id=property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="集合住宅が見つかりません")

    # 営業員は自分の担当物件のみ閲覧可能
    if current_user.role == "sales" and property_obj.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")

    return property_obj


@router.put("/{property_id}", response_model=Property)
def update_property(
    *,
    db: Session = Depends(get_db),
    property_id: int,
    property_in: PropertyUpdate,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅情報更新
    """
    property_obj = crud_property.get(db, id=property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="集合住宅が見つかりません")

    # 営業員は自分の担当物件のみ更新可能
    if current_user.role == "sales" and property_obj.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")

    property_obj = crud_property.update(db, db_obj=property_obj, obj_in=property_in)
    return property_obj


@router.delete("/{property_id}")
def delete_property(
    *,
    db: Session = Depends(get_db),
    property_id: int,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    集合住宅削除（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="管理者のみ削除できます")

    property_obj = crud_property.get(db, id=property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="集合住宅が見つかりません")

    crud_property.remove(db, id=property_id)
    return {"message": "集合住宅を削除しました"}
