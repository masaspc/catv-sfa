from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.crud import crud_contract
from app.models.user import User
from app.schemas.contract import Contract, ContractCreate, ContractUpdate
from app.utils.export import export_to_csv, convert_to_dict_list

router = APIRouter()


@router.get("", response_model=List[Contract])
def read_contracts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> List[Contract]:
    """
    契約一覧を取得
    """
    contracts = crud_contract.get_multi(db, skip=skip, limit=limit)
    return contracts


@router.post("", response_model=Contract)
def create_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_in: ContractCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Contract:
    """
    契約を作成
    """
    contract = crud_contract.create(db, obj_in=contract_in)
    return contract


@router.get("/active", response_model=List[Contract])
def read_active_contracts(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> List[Contract]:
    """
    有効な契約一覧を取得（解約日が未設定）
    """
    contracts = crud_contract.get_active_contracts(db, skip=skip, limit=limit)
    return contracts


@router.get("/search", response_model=List[Contract])
def search_contracts(
    *,
    db: Session = Depends(deps.get_db),
    query: str,
    current_user: User = Depends(deps.get_current_user),
) -> List[Contract]:
    """
    契約を検索
    """
    contracts = crud_contract.search(db, query=query)
    return contracts


@router.get("/{contract_id}", response_model=Contract)
def read_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Contract:
    """
    契約詳細を取得
    """
    contract = crud_contract.get(db, id=contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


@router.put("/{contract_id}", response_model=Contract)
def update_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_id: int,
    contract_in: ContractUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Contract:
    """
    契約を更新
    """
    contract = crud_contract.get(db, id=contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = crud_contract.update(db, db_obj=contract, obj_in=contract_in)
    return contract


@router.delete("/{contract_id}", response_model=Contract)
def delete_contract(
    *,
    db: Session = Depends(deps.get_db),
    contract_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Contract:
    """
    契約を削除（管理者のみ）
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    contract = crud_contract.get(db, id=contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract = crud_contract.remove(db, id=contract_id)
    return contract



@router.get("/export/csv")
def export_contracts_csv(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10000,
    current_user: User = Depends(deps.get_current_user),
) -> StreamingResponse:
    """
    契約データをCSV形式でエクスポート
    """
    contracts = crud_contract.get_multi(db, skip=skip, limit=limit)
    contracts_dict = convert_to_dict_list(contracts)

    headers = [
        "id", "service_type", "plan_name", "monthly_fee", "payment_method",
        "start_date", "end_date", "customer_id", "property_id", "notes",
        "created_at", "updated_at"
    ]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"contracts_{timestamp}.csv"

    return export_to_csv(contracts_dict, filename, headers)

