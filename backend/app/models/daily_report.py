from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Text, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class DailyReport(Base):
    """日報モデル"""
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_date = Column(Date, nullable=False, index=True)

    # 時刻
    start_time = Column(Time)
    end_time = Column(Time)

    # 活動実績
    visits_count = Column(Integer, default=0)  # 訪問件数
    new_contacts_count = Column(Integer, default=0)  # 新規接触件数
    deals_count = Column(Integer, default=0)  # 商談件数
    orders_count = Column(Integer, default=0)  # 受注件数

    # 活動内容
    content = Column(Text)  # 活動内容
    insights = Column(Text)  # 今日の気づき・課題
    tomorrow_plan = Column(Text)  # 明日の予定

    # 添付ファイル（カンマ区切りでパスを保存）
    attachments = Column(Text)

    # 担当営業員
    sales_person_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sales_person = relationship("User")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
