from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from app.models.customer import CustomerType


class CustomerBase(BaseModel):
    """顧客基底スキーマ"""
    name: Optional[str] = None
    name_kana: Optional[str] = None
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    email: Optional[EmailStr] = None
    postal_code: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    birth_date: Optional[date] = None
    customer_type: Optional[CustomerType] = None
    sales_person_id: Optional[int] = None


class CustomerCreate(CustomerBase):
    """顧客作成スキーマ"""
    name: str
    customer_type: CustomerType = CustomerType.PROSPECT


class CustomerUpdate(CustomerBase):
    """顧客更新スキーマ"""
    pass


class CustomerInDBBase(CustomerBase):
    """DB保存顧客スキーマ基底"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Customer(CustomerInDBBase):
    """顧客スキーマ（レスポンス用）"""
    pass


class CustomerList(BaseModel):
    """顧客一覧レスポンス"""
    total: int
    items: list[Customer]
