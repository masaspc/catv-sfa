from fastapi import APIRouter
from app.api.endpoints import auth, users, customers, properties

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(users.router, prefix="/users", tags=["ユーザー"])
api_router.include_router(customers.router, prefix="/customers", tags=["顧客管理"])
api_router.include_router(properties.router, prefix="/properties", tags=["集合住宅管理"])
