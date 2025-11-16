from sqlalchemy.orm import Session
from app.core.config import settings
from app.crud import crud_user
from app.schemas.user import UserCreate
from app.models.user import UserRole


def init_db(db: Session) -> None:
    """
    初期データを作成
    """
    # 管理者ユーザーが存在するか確認
    user = crud_user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            username=settings.FIRST_SUPERUSER_USERNAME,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name="システム管理者",
            role=UserRole.ADMIN,
        )
        user = crud_user.create(db, obj_in=user_in)
        print(f"管理者ユーザーを作成しました: {user.email}")
    else:
        print(f"管理者ユーザーは既に存在します: {user.email}")
