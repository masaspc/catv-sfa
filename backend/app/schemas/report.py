from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class ReportBase(BaseModel):
    """レポート基本スキーマ"""
    report_type: str  # 'monthly', 'weekly', 'custom'
    period_start: datetime
    period_end: datetime
    title: str
    description: Optional[str] = None


class ReportGenerate(BaseModel):
    """レポート生成リクエスト"""
    report_type: str
    period_start: str
    period_end: str
    include_charts: bool = True
    sales_person_id: Optional[int] = None  # None = 全体レポート


class ReportData(BaseModel):
    """レポートデータ"""
    summary: Dict[str, Any]
    deals_by_phase: Dict[str, int]
    deals_by_type: Dict[str, int]
    revenue_metrics: Dict[str, Any]
    activity_metrics: Dict[str, Any]
    top_performers: List[Dict[str, Any]]
    contract_metrics: Dict[str, Any]


class Report(ReportBase):
    """レポート完全スキーマ"""
    id: int
    user_id: int
    data: ReportData
    created_at: datetime

    class Config:
        from_attributes = True


class ReportSummary(BaseModel):
    """レポートサマリー（一覧表示用）"""
    id: int
    report_type: str
    period_start: datetime
    period_end: datetime
    title: str
    created_at: datetime

    class Config:
        from_attributes = True
