from app.crud.crud_user import crud_user
from app.crud.crud_customer import crud_customer
from app.crud.crud_property import crud_property
from app.crud.crud_deal import crud_deal
from app.crud.crud_activity import crud_activity
from app.crud.crud_daily_report import crud_daily_report
from app.crud.crud_contract import crud_contract
from app.crud.crud_notification import crud_notification

__all__ = [
    "crud_user",
    "crud_customer",
    "crud_property",
    "crud_deal",
    "crud_activity",
    "crud_daily_report",
    "crud_contract",
    "crud_notification",
]
