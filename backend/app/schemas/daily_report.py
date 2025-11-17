from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time


class DailyReportBase(BaseModel):
    report_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    visits_count: Optional[int] = 0
    new_contacts_count: Optional[int] = 0
    deals_count: Optional[int] = 0
    orders_count: Optional[int] = 0
    content: Optional[str] = None
    insights: Optional[str] = None
    tomorrow_plan: Optional[str] = None
    attachments: Optional[str] = None


class DailyReportCreate(DailyReportBase):
    pass


class DailyReportUpdate(BaseModel):
    report_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    visits_count: Optional[int] = None
    new_contacts_count: Optional[int] = None
    deals_count: Optional[int] = None
    orders_count: Optional[int] = None
    content: Optional[str] = None
    insights: Optional[str] = None
    tomorrow_plan: Optional[str] = None
    attachments: Optional[str] = None


class DailyReport(DailyReportBase):
    id: int
    sales_person_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
