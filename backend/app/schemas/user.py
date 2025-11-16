from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """ユーザー基底スキーマ"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    """ユーザー作成スキーマ"""
    email: EmailStr
    username: str
    password: str
    role: UserRole = UserRole.SALES


class UserUpdate(UserBase):
    """ユーザー更新スキーマ"""
    password: Optional[str] = None


class UserInDBBase(UserBase):
    """DB保存ユーザースキーマ基底"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """ユーザースキーマ（レスポンス用）"""
    pass


class UserInDB(UserInDBBase):
    """ユーザースキーマ（DB内部用）"""
    hashed_password: str
