from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate


class CRUDDeal(CRUDBase[Deal, DealCreate, DealUpdate]):
    def get_by_sales_person(
        self, db: Session, *, sales_person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Deal]:
        """担当営業員の案件を取得"""
        return db.query(Deal).filter(
            Deal.sales_person_id == sales_person_id
        ).offset(skip).limit(limit).all()

    def get_by_customer(
        self, db: Session, *, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Deal]:
        """顧客の案件を取得"""
        return db.query(Deal).filter(
            Deal.customer_id == customer_id
        ).offset(skip).limit(limit).all()

    def get_by_property(
        self, db: Session, *, property_id: int, skip: int = 0, limit: int = 100
    ) -> List[Deal]:
        """集合住宅の案件を取得"""
        return db.query(Deal).filter(
            Deal.property_id == property_id
        ).offset(skip).limit(limit).all()

    def create_with_sales_person(
        self, db: Session, *, obj_in: DealCreate, sales_person_id: int
    ) -> Deal:
        """案件を作成（営業員IDを設定）"""
        db_obj = Deal(
            **obj_in.model_dump(),
            sales_person_id=sales_person_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def search(self, db: Session, *, query: str, skip: int = 0, limit: int = 100) -> List[Deal]:
        """案件を検索"""
        return db.query(Deal).filter(
            Deal.deal_name.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()


crud_deal = CRUDDeal(Deal)
