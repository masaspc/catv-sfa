from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.crud import crud_customer
from app.models.user import User as UserModel
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate, CustomerList

router = APIRouter()


@router.get("/", response_model=CustomerList)
def read_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客一覧取得
    """
    # 営業員は自分の担当顧客のみ、管理者は全て
    if current_user.role == "sales":
        customers = crud_customer.get_by_sales_person(
            db, sales_person_id=current_user.id, skip=skip, limit=limit
        )
    else:
        customers = crud_customer.get_multi(db, skip=skip, limit=limit)

    total = crud_customer.count(db)
    return {"total": total, "items": customers}


@router.post("/", response_model=Customer)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: CustomerCreate,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客新規作成
    """
    # 担当営業員が指定されていない場合は作成者を設定
    if not customer_in.sales_person_id:
        customer_in.sales_person_id = current_user.id

    customer = crud_customer.create(db, obj_in=customer_in)
    return customer


@router.get("/search", response_model=List[Customer])
def search_customers(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客検索
    """
    customers = crud_customer.search(db, query=query, skip=skip, limit=limit)
    return customers


@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客詳細取得
    """
    customer = crud_customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")

    # 営業員は自分の担当顧客のみ閲覧可能
    if current_user.role == "sales" and customer.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")

    return customer


@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    customer_in: CustomerUpdate,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客情報更新
    """
    customer = crud_customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")

    # 営業員は自分の担当顧客のみ更新可能
    if current_user.role == "sales" and customer.sales_person_id != current_user.id:
        raise HTTPException(status_code=403, detail="アクセス権限がありません")

    customer = crud_customer.update(db, db_obj=customer, obj_in=customer_in)
    return customer


@router.delete("/{customer_id}")
def delete_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: UserModel = Depends(get_current_active_user),
) -> Any:
    """
    顧客削除（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="管理者のみ削除できます")

    customer = crud_customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="顧客が見つかりません")

    crud_customer.remove(db, id=customer_id)
    return {"message": "顧客を削除しました"}
