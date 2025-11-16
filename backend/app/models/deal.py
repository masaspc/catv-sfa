from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class DealType(str, enum.Enum):
    """案件種別"""
    NEW_INDIVIDUAL = "new_individual"  # 新規個人
    NEW_CORPORATE = "new_corporate"  # 新規法人
    NEW_PROPERTY = "new_property"  # 新規集合住宅
    UPSELL = "upsell"  # 既存アップセル
    RETENTION = "retention"  # リテンション


class DealPhase(str, enum.Enum):
    """営業フェーズ（個人向け）"""
    LEAD_GENERATION = "lead_generation"  # 見込客発掘
    FIRST_CONTACT = "first_contact"  # 初回接触
    NEEDS_HEARING = "needs_hearing"  # ニーズヒアリング
    PROPOSAL = "proposal"  # 提案・見積提示
    CLOSING = "closing"  # クロージング
    CONTRACT = "contract"  # 契約手続き
    CONSTRUCTION = "construction"  # 開通工事
    WON = "won"  # 受注完了
    LOST = "lost"  # 失注


class PropertyDealPhase(str, enum.Enum):
    """営業フェーズ（集合住宅向け）"""
    RESEARCH = "research"  # 物件情報収集
    APPOINTMENT = "appointment"  # 管理会社・オーナーアポイント
    SURVEY = "survey"  # 現地調査
    PROPOSAL_CREATION = "proposal_creation"  # 提案書作成
    PRESENTATION = "presentation"  # 提案プレゼン
    BOARD_APPROVAL = "board_approval"  # 理事会承認
    NEGOTIATION = "negotiation"  # 契約交渉
    CONTRACT_SIGNED = "contract_signed"  # 契約締結
    CONSTRUCTION_PLANNING = "construction_planning"  # 工事調整
    CONSTRUCTION_COMPLETE = "construction_complete"  # 工事完了
    LOST = "lost"  # 失注


class Deal(Base):
    """案件モデル"""
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    deal_name = Column(String(255), nullable=False)
    deal_type = Column(SQLEnum(DealType), nullable=False)

    # 顧客・物件との紐付け
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer")

    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    property = relationship("Property")

    # 案件情報
    estimated_amount = Column(Integer)  # 見積金額
    probability = Column(Integer)  # 受注確度（0-100%）
    phase = Column(String(50))  # DealPhase または PropertyDealPhase

    expected_close_date = Column(DateTime(timezone=True))  # 受注予定日
    actual_close_date = Column(DateTime(timezone=True))  # 実際の受注日

    lost_reason = Column(Text)  # 失注理由

    # 担当営業員
    sales_person_id = Column(Integer, ForeignKey("users.id"))
    sales_person = relationship("User")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
