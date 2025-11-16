from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class ActivityType(str, enum.Enum):
    """活動種別"""
    VISIT = "visit"  # 訪問
    CALL = "call"  # 電話
    EMAIL = "email"  # メール
    MEETING = "meeting"  # 打ち合わせ
    OTHER = "other"  # その他


class Activity(Base):
    """営業活動モデル"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    activity_date = Column(DateTime(timezone=True), nullable=False)
    activity_type = Column(SQLEnum(ActivityType), nullable=False)

    # 関連先
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer")

    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    property = relationship("Property")

    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    deal = relationship("Deal")

    # 活動内容
    content = Column(Text)
    result = Column(Text)  # 実施結果
    next_action = Column(Text)  # 次回アクション
    next_action_date = Column(DateTime(timezone=True))

    # 添付ファイル（将来的にファイルパスを保存）
    attachments = Column(Text)

    # 位置情報
    latitude = Column(String(50))
    longitude = Column(String(50))

    # 担当営業員
    sales_person_id = Column(Integer, ForeignKey("users.id"))
    sales_person = relationship("User")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
