from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DealBase(BaseModel):
    deal_name: str
    deal_type: str
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    estimated_amount: Optional[int] = None
    probability: Optional[int] = None
    phase: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    actual_close_date: Optional[datetime] = None
    lost_reason: Optional[str] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    deal_name: Optional[str] = None
    deal_type: Optional[str] = None
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    estimated_amount: Optional[int] = None
    probability: Optional[int] = None
    phase: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    actual_close_date: Optional[datetime] = None
    lost_reason: Optional[str] = None


class Deal(DealBase):
    id: int
    sales_person_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
