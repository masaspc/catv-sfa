from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContractBase(BaseModel):
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    service_type: str
    plan_name: Optional[str] = None
    monthly_fee: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    service_type: Optional[str] = None
    plan_name: Optional[str] = None
    monthly_fee: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class Contract(ContractBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
