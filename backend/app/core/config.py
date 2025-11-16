from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    """アプリケーション設定"""

    # プロジェクト情報
    PROJECT_NAME: str = "CATV SFA System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # セキュリティ
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24時間

    # データベース
    DATABASE_URL: str = "postgresql://catv_user:catv_password@db:5432/catv_sfa_db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # 環境
    ENVIRONMENT: str = "development"

    # 初期管理者ユーザー
    FIRST_SUPERUSER_EMAIL: str = "admin@tokyobaynet.com"
    FIRST_SUPERUSER_PASSWORD: str = "admin123"
    FIRST_SUPERUSER_USERNAME: str = "admin"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
