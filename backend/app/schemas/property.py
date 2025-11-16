from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.property import PropertyType, ManagementType, CATVStatus, SalesStatus


class PropertyBase(BaseModel):
    """集合住宅基底スキーマ"""
    property_name: Optional[str] = None
    postal_code: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    property_type: Optional[PropertyType] = None
    total_units: Optional[int] = None
    floors: Optional[int] = None
    built_year: Optional[int] = None
    management_type: Optional[ManagementType] = None
    management_company_name: Optional[str] = None
    management_contact_person: Optional[str] = None
    management_phone: Optional[str] = None
    management_email: Optional[EmailStr] = None
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_email: Optional[EmailStr] = None
    catv_status: Optional[CATVStatus] = None
    sales_status: Optional[SalesStatus] = None
    bulk_contract_service: Optional[str] = None
    facility_fee_monthly: Optional[int] = None
    contract_start_date: Optional[datetime] = None
    construction_date: Optional[datetime] = None
    competitor_info: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notes: Optional[str] = None
    sales_person_id: Optional[int] = None


class PropertyCreate(PropertyBase):
    """集合住宅作成スキーマ"""
    property_name: str
    catv_status: CATVStatus = CATVStatus.NOT_INTRODUCED
    sales_status: SalesStatus = SalesStatus.NOT_CONTACTED


class PropertyUpdate(PropertyBase):
    """集合住宅更新スキーマ"""
    pass


class PropertyInDBBase(PropertyBase):
    """DB保存集合住宅スキーマ基底"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Property(PropertyInDBBase):
    """集合住宅スキーマ（レスポンス用）"""
    pass


class PropertyList(BaseModel):
    """集合住宅一覧レスポンス"""
    total: int
    items: list[Property]
