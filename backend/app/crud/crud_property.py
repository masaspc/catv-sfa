from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate


class CRUDProperty(CRUDBase[Property, PropertyCreate, PropertyUpdate]):
    def get_by_sales_person(
        self, db: Session, *, sales_person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Property]:
        """担当営業員で集合住宅を取得"""
        return (
            db.query(Property)
            .filter(Property.sales_person_id == sales_person_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search(
        self, db: Session, *, query: str, skip: int = 0, limit: int = 100
    ) -> List[Property]:
        """集合住宅を検索（物件名、住所で検索）"""
        return (
            db.query(Property)
            .filter(
                or_(
                    Property.property_name.contains(query),
                    Property.address_line1.contains(query),
                    Property.city.contains(query),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_city(
        self, db: Session, *, city: str, skip: int = 0, limit: int = 100
    ) -> List[Property]:
        """市区町村で集合住宅を取得"""
        return (
            db.query(Property)
            .filter(Property.city == city)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self, db: Session) -> int:
        """集合住宅数を取得"""
        return db.query(Property).count()


crud_property = CRUDProperty(Property)
