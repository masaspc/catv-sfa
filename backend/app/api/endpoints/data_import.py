"""データインポートAPIエンドポイント"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.utils.csv_import import import_customers_from_csv, import_deals_from_csv

router = APIRouter()


@router.post("/customers/csv")
async def import_customers_csv(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
):
    """
    CSVファイルから顧客データをインポート

    CSVフォーマット:
    - customer_name: 顧客名（必須）
    - customer_type: 顧客種別（必須: individual, corporate, property）
    - contact_person: 担当者名
    - email: メールアドレス
    - phone: 電話番号
    - address: 住所
    - notes: 備考

    管理者・マネージャーのみ実行可能
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # ファイルタイプチェック
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSVファイルのみアップロード可能です"
        )

    # ファイル読み込み
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ファイルの読み込みに失敗しました: {str(e)}"
        )

    # インポート実行
    result = import_customers_from_csv(db, content, current_user.id)

    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'インポートに失敗しました')
        )

    return {
        "message": f"インポートが完了しました。成功: {result['imported']}件、失敗: {result['failed']}件",
        "imported": result['imported'],
        "failed": result['failed'],
        "total": result['total'],
        "errors": result['errors'][:10]  # エラーメッセージは最大10件まで返す
    }


@router.post("/deals/csv")
async def import_deals_csv(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user),
):
    """
    CSVファイルから案件データをインポート

    CSVフォーマット:
    - deal_name: 案件名（必須）
    - deal_type: 案件種別（必須: new_individual, new_corporate, new_property, upsell, retention）
    - customer_id: 顧客ID
    - property_id: 集合住宅ID
    - phase: フェーズ（prospecting, qualification, proposal, negotiation, closing, won, lost）
    - estimated_amount: 見積金額
    - probability: 受注確度（0-100）
    - expected_close_date: 受注予定日（YYYY-MM-DD形式）
    - notes: 備考

    管理者・マネージャーのみ実行可能
    インポート実行ユーザーが自動的に営業担当者として設定されます
    """
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この操作を実行する権限がありません"
        )

    # ファイルタイプチェック
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSVファイルのみアップロード可能です"
        )

    # ファイル読み込み
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ファイルの読み込みに失敗しました: {str(e)}"
        )

    # インポート実行
    result = import_deals_from_csv(db, content, current_user.id)

    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get('error', 'インポートに失敗しました')
        )

    return {
        "message": f"インポートが完了しました。成功: {result['imported']}件、失敗: {result['failed']}件",
        "imported": result['imported'],
        "failed": result['failed'],
        "total": result['total'],
        "errors": result['errors'][:10]
    }


@router.get("/template/customers")
def download_customer_template():
    """
    顧客インポート用CSVテンプレートを取得

    Returns:
        CSVテンプレートの内容
    """
    template = """customer_name,customer_type,contact_person,email,phone,address,notes
山田太郎,individual,山田太郎,yamada@example.com,090-1234-5678,東京都渋谷区1-1-1,サンプルデータ
株式会社サンプル,corporate,鈴木次郎,suzuki@sample.co.jp,03-1234-5678,東京都新宿区2-2-2,法人顧客サンプル
"""
    return {
        "content": template,
        "filename": "customer_import_template.csv"
    }


@router.get("/template/deals")
def download_deal_template():
    """
    案件インポート用CSVテンプレートを取得

    Returns:
        CSVテンプレートの内容
    """
    template = """deal_name,deal_type,customer_id,property_id,phase,estimated_amount,probability,expected_close_date,notes
新規契約案件1,new_individual,1,,prospecting,100000,50,2025-12-31,サンプル案件1
アップセル案件1,upsell,2,,proposal,50000,70,2025-11-30,サンプル案件2
"""
    return {
        "content": template,
        "filename": "deal_import_template.csv"
    }
