from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """トークンレスポンス"""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """トークンペイロード"""
    sub: Optional[int] = None
