from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Report(Base):
    """レポートモデル"""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    report_type = Column(String, nullable=False, index=True)  # 'monthly', 'weekly', 'custom'
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    data = Column(JSON, nullable=False)  # レポートデータ（集計結果）
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # リレーション
    user = relationship("User", back_populates="reports")
