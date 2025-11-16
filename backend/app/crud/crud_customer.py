from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    def get_by_sales_person(
        self, db: Session, *, sales_person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Customer]:
        """担当営業員で顧客を取得"""
        return (
            db.query(Customer)
            .filter(Customer.sales_person_id == sales_person_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Customer]:
        """顧客を検索（名前、電話番号、メールで検索）"""
        return (
            db.query(Customer)
            .filter(
                or_(
                    Customer.name.contains(query),
                    Customer.name_kana.contains(query),
                    Customer.phone_primary.contains(query),
                    Customer.email.contains(query),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self, db: Session) -> int:
        """顧客数を取得"""
        return db.query(Customer).count()


crud_customer = CRUDCustomer(Customer)
