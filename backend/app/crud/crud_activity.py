from typing import List
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate


class CRUDActivity(CRUDBase[Activity, ActivityCreate, ActivityUpdate]):
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """営業活動一覧を取得（日付降順）"""
        return db.query(Activity).order_by(Activity.activity_date.desc()).offset(skip).limit(limit).all()

    def get_by_sales_person(
        self, db: Session, *, sales_person_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """担当営業員の営業活動を取得"""
        return db.query(Activity).filter(
            Activity.sales_person_id == sales_person_id
        ).order_by(Activity.activity_date.desc()).offset(skip).limit(limit).all()

    def get_by_customer(
        self, db: Session, *, customer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """顧客の営業活動を取得"""
        return db.query(Activity).filter(
            Activity.customer_id == customer_id
        ).order_by(Activity.activity_date.desc()).offset(skip).limit(limit).all()

    def get_by_property(
        self, db: Session, *, property_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """集合住宅の営業活動を取得"""
        return db.query(Activity).filter(
            Activity.property_id == property_id
        ).order_by(Activity.activity_date.desc()).offset(skip).limit(limit).all()

    def get_by_deal(
        self, db: Session, *, deal_id: int, skip: int = 0, limit: int = 100
    ) -> List[Activity]:
        """案件の営業活動を取得"""
        return db.query(Activity).filter(
            Activity.deal_id == deal_id
        ).order_by(Activity.activity_date.desc()).offset(skip).limit(limit).all()

    def create_with_sales_person(
        self, db: Session, *, obj_in: ActivityCreate, sales_person_id: int
    ) -> Activity:
        """営業活動を作成（営業員IDを設定）"""
        db_obj = Activity(
            **obj_in.model_dump(),
            sales_person_id=sales_person_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_activity = CRUDActivity(Activity)
