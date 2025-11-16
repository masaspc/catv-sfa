from sqlalchemy import Column, Integer, String, Date, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class CustomerType(str, enum.Enum):
    """顧客区分"""
    PROSPECT = "prospect"  # 見込客
    CONTRACTED = "contracted"  # 契約者
    CANCELED = "canceled"  # 解約者
    DORMANT = "dormant"  # 休眠顧客


class Customer(Base):
    """個人顧客モデル"""
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    name_kana = Column(String(100))
    phone_primary = Column(String(20))
    phone_secondary = Column(String(20))
    email = Column(String(255))

    # 住所情報
    postal_code = Column(String(10))
    prefecture = Column(String(50))
    city = Column(String(100))
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))  # 建物名・部屋番号

    birth_date = Column(Date)
    customer_type = Column(SQLEnum(CustomerType), default=CustomerType.PROSPECT)

    # 担当営業員
    sales_person_id = Column(Integer, ForeignKey("users.id"))
    sales_person = relationship("User")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
