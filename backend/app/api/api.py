from fastapi import APIRouter
from app.api.endpoints import auth, users, customers, properties, deals, activities, daily_reports, contracts, dashboard

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(users.router, prefix="/users", tags=["ユーザー"])
api_router.include_router(customers.router, prefix="/customers", tags=["顧客管理"])
api_router.include_router(properties.router, prefix="/properties", tags=["集合住宅管理"])
api_router.include_router(deals.router, prefix="/deals", tags=["案件管理"])
api_router.include_router(activities.router, prefix="/activities", tags=["営業活動"])
api_router.include_router(daily_reports.router, prefix="/daily-reports", tags=["日報"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["契約管理"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["ダッシュボード"])
