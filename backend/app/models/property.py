from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Float, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class PropertyType(str, enum.Enum):
    """物件種別"""
    OWNED_MANSION = "owned_mansion"  # 分譲マンション
    RENTAL_MANSION = "rental_mansion"  # 賃貸マンション
    APARTMENT = "apartment"  # アパート
    COMPANY_HOUSING = "company_housing"  # 社宅
    OTHER = "other"  # その他


class ManagementType(str, enum.Enum):
    """管理形態"""
    SELF_MANAGED = "self_managed"  # 自主管理
    MANAGEMENT_COMPANY = "management_company"  # 管理会社


class CATVStatus(str, enum.Enum):
    """CATV導入状況"""
    NOT_INTRODUCED = "not_introduced"  # 未導入
    BULK_CONTRACT = "bulk_contract"  # 一括導入済
    INDIVIDUAL_AVAILABLE = "individual_available"  # 個別契約可


class SalesStatus(str, enum.Enum):
    """導入検討状況"""
    NOT_CONTACTED = "not_contacted"  # 未接触
    PROPOSING = "proposing"  # 提案中
    CONSIDERING = "considering"  # 検討中
    DECIDED = "decided"  # 導入決定
    DECLINED = "declined"  # 見送り


class Property(Base):
    """集合住宅モデル"""
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    property_name = Column(String(255), nullable=False, index=True)

    # 住所情報
    postal_code = Column(String(10))
    prefecture = Column(String(50))
    city = Column(String(100))
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))

    # 建物情報
    property_type = Column(SQLEnum(PropertyType))
    total_units = Column(Integer)  # 総戸数
    floors = Column(Integer)  # 階数
    built_year = Column(Integer)  # 築年

    # 管理情報
    management_type = Column(SQLEnum(ManagementType))
    management_company_name = Column(String(255))
    management_contact_person = Column(String(100))
    management_phone = Column(String(20))
    management_email = Column(String(255))

    owner_name = Column(String(100))
    owner_phone = Column(String(20))
    owner_email = Column(String(255))

    # CATV導入状況
    catv_status = Column(SQLEnum(CATVStatus), default=CATVStatus.NOT_INTRODUCED)
    sales_status = Column(SQLEnum(SalesStatus), default=SalesStatus.NOT_CONTACTED)

    # 契約情報
    bulk_contract_service = Column(String(255))  # 一括契約サービス内容
    facility_fee_monthly = Column(Integer)  # 施設利用料（月額/戸）
    contract_start_date = Column(DateTime(timezone=True))
    construction_date = Column(DateTime(timezone=True))

    # 競合情報
    competitor_info = Column(Text)

    # 地図情報
    latitude = Column(Float)
    longitude = Column(Float)

    # メモ
    notes = Column(Text)

    # 担当営業員
    sales_person_id = Column(Integer, ForeignKey("users.id"))
    sales_person = relationship("User")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
