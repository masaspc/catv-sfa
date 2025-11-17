from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityBase(BaseModel):
    activity_date: datetime
    activity_type: str
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    deal_id: Optional[int] = None
    content: Optional[str] = None
    result: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    attachments: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    activity_date: Optional[datetime] = None
    activity_type: Optional[str] = None
    customer_id: Optional[int] = None
    property_id: Optional[int] = None
    deal_id: Optional[int] = None
    content: Optional[str] = None
    result: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    attachments: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None


class Activity(ActivityBase):
    id: int
    sales_person_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
