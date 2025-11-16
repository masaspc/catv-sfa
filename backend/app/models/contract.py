from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class ServiceType(str, enum.Enum):
    """サービス種別"""
    TERRESTRIAL_ONLY = "terrestrial_only"  # 地上波のみ
    WITH_BS_CS = "with_bs_cs"  # BS・CS込み
    WITH_INTERNET = "with_internet"  # インターネット込み
    WITH_PHONE = "with_phone"  # 電話込み
    SET_CONTRACT = "set_contract"  # セット契約


class PaymentMethod(str, enum.Enum):
    """支払方法"""
    CREDIT_CARD = "credit_card"  # クレジットカード
    BANK_TRANSFER = "bank_transfer"  # 銀行振込
    DIRECT_DEBIT = "direct_debit"  # 口座振替
    CONVENIENCE_STORE = "convenience_store"  # コンビニ払い


class Contract(Base):
    """契約モデル"""
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)

    # 顧客・物件との紐付け
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer")

    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    property = relationship("Property")

    # 契約情報
    service_type = Column(SQLEnum(ServiceType), nullable=False)
    plan_name = Column(String(100))
    monthly_fee = Column(Integer)  # 月額料金

    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))  # 解約日

    payment_method = Column(SQLEnum(PaymentMethod))

    # メモ
    notes = Column(String(500))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
