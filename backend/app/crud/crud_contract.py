from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.contract import Contract
from app.schemas.contract import ContractCreate, ContractUpdate


class CRUDContract(CRUDBase[Contract, ContractCreate, ContractUpdate]):
    def get_by_customer(
        self, db: Session, *, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Contract]:
        """顧客の契約を取得"""
        return db.query(Contract).filter(
            Contract.customer_id == customer_id
        ).offset(skip).limit(limit).all()

    def get_by_property(
        self, db: Session, *, property_id: int, skip: int = 0, limit: int = 100
    ) -> List[Contract]:
        """集合住宅の契約を取得"""
        return db.query(Contract).filter(
            Contract.property_id == property_id
        ).offset(skip).limit(limit).all()

    def get_active_contracts(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Contract]:
        """有効な契約を取得（解約日が未設定）"""
        return db.query(Contract).filter(
            Contract.end_date.is_(None)
        ).offset(skip).limit(limit).all()

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> List[Contract]:
        """契約を検索（プラン名で検索）"""
        return db.query(Contract).filter(
            Contract.plan_name.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()


crud_contract = CRUDContract(Contract)
