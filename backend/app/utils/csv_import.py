"""CSVインポートユーティリティ"""
import csv
import io
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app import crud
from app.schemas.customer import CustomerCreate
from app.schemas.deal import DealCreate


def parse_csv(file_content: bytes) -> List[Dict[str, str]]:
    """
    CSVファイルを解析してリストに変換

    Args:
        file_content: CSVファイルのバイトデータ

    Returns:
        辞書のリスト（各行がキーと値のペア）
    """
    # BOM付きUTF-8をデコード
    try:
        content = file_content.decode('utf-8-sig')
    except UnicodeDecodeError:
        content = file_content.decode('shift_jis')

    reader = csv.DictReader(io.StringIO(content))
    return list(reader)


def validate_customer_data(row: Dict[str, str], row_num: int) -> Tuple[bool, List[str]]:
    """
    顧客データのバリデーション

    Args:
        row: CSV行データ
        row_num: 行番号

    Returns:
        (成功フラグ, エラーメッセージリスト)
    """
    errors = []

    # 必須フィールドチェック
    required_fields = ['customer_name', 'customer_type']
    for field in required_fields:
        if not row.get(field) or not row[field].strip():
            errors.append(f"行{row_num}: {field}は必須です")

    # customer_typeのバリデーション
    valid_types = ['individual', 'corporate', 'property']
    if row.get('customer_type') and row['customer_type'] not in valid_types:
        errors.append(f"行{row_num}: customer_typeは{', '.join(valid_types)}のいずれかである必要があります")

    return (len(errors) == 0, errors)


def import_customers_from_csv(
    db: Session,
    file_content: bytes,
    user_id: int
) -> Dict[str, Any]:
    """
    CSVファイルから顧客データをインポート

    Args:
        db: データベースセッション
        file_content: CSVファイルのバイトデータ
        user_id: インポート実行ユーザーID

    Returns:
        インポート結果（成功数、失敗数、エラーメッセージ）
    """
    try:
        rows = parse_csv(file_content)
    except Exception as e:
        return {
            'success': False,
            'error': f'CSVファイルの解析に失敗しました: {str(e)}',
            'imported': 0,
            'failed': 0,
            'errors': []
        }

    imported = 0
    failed = 0
    errors = []

    for idx, row in enumerate(rows, start=2):  # ヘッダー行を除くため2から開始
        # バリデーション
        is_valid, validation_errors = validate_customer_data(row, idx)
        if not is_valid:
            errors.extend(validation_errors)
            failed += 1
            continue

        try:
            # 顧客データ作成
            customer_data = CustomerCreate(
                customer_name=row['customer_name'].strip(),
                customer_type=row['customer_type'].strip(),
                contact_person=row.get('contact_person', '').strip() or None,
                email=row.get('email', '').strip() or None,
                phone=row.get('phone', '').strip() or None,
                address=row.get('address', '').strip() or None,
                notes=row.get('notes', '').strip() or None,
            )

            # データベースに登録
            crud.crud_customer.create(db, obj_in=customer_data)
            imported += 1

        except Exception as e:
            errors.append(f"行{idx}: データ登録エラー - {str(e)}")
            failed += 1

    return {
        'success': True,
        'imported': imported,
        'failed': failed,
        'errors': errors,
        'total': len(rows)
    }


def validate_deal_data(row: Dict[str, str], row_num: int) -> Tuple[bool, List[str]]:
    """
    案件データのバリデーション

    Args:
        row: CSV行データ
        row_num: 行番号

    Returns:
        (成功フラグ, エラーメッセージリスト)
    """
    errors = []

    # 必須フィールドチェック
    required_fields = ['deal_name', 'deal_type']
    for field in required_fields:
        if not row.get(field) or not row[field].strip():
            errors.append(f"行{row_num}: {field}は必須です")

    # deal_typeのバリデーション
    valid_types = ['new_individual', 'new_corporate', 'new_property', 'upsell', 'retention']
    if row.get('deal_type') and row['deal_type'] not in valid_types:
        errors.append(f"行{row_num}: deal_typeは{', '.join(valid_types)}のいずれかである必要があります")

    # phaseのバリデーション
    if row.get('phase'):
        valid_phases = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing', 'won', 'lost']
        if row['phase'] not in valid_phases:
            errors.append(f"行{row_num}: phaseは{', '.join(valid_phases)}のいずれかである必要があります")

    # 数値フィールドのバリデーション
    if row.get('estimated_amount'):
        try:
            float(row['estimated_amount'])
        except ValueError:
            errors.append(f"行{row_num}: estimated_amountは数値である必要があります")

    if row.get('probability'):
        try:
            prob = int(row['probability'])
            if prob < 0 or prob > 100:
                errors.append(f"行{row_num}: probabilityは0-100の範囲である必要があります")
        except ValueError:
            errors.append(f"行{row_num}: probabilityは整数である必要があります")

    return (len(errors) == 0, errors)


def import_deals_from_csv(
    db: Session,
    file_content: bytes,
    user_id: int
) -> Dict[str, Any]:
    """
    CSVファイルから案件データをインポート

    Args:
        db: データベースセッション
        file_content: CSVファイルのバイトデータ
        user_id: インポート実行ユーザーID

    Returns:
        インポート結果（成功数、失敗数、エラーメッセージ）
    """
    try:
        rows = parse_csv(file_content)
    except Exception as e:
        return {
            'success': False,
            'error': f'CSVファイルの解析に失敗しました: {str(e)}',
            'imported': 0,
            'failed': 0,
            'errors': []
        }

    imported = 0
    failed = 0
    errors = []

    for idx, row in enumerate(rows, start=2):
        # バリデーション
        is_valid, validation_errors = validate_deal_data(row, idx)
        if not is_valid:
            errors.extend(validation_errors)
            failed += 1
            continue

        try:
            # 案件データ作成
            deal_data = DealCreate(
                deal_name=row['deal_name'].strip(),
                deal_type=row['deal_type'].strip(),
                customer_id=int(row['customer_id']) if row.get('customer_id') and row['customer_id'].strip() else None,
                property_id=int(row['property_id']) if row.get('property_id') and row['property_id'].strip() else None,
                phase=row.get('phase', '').strip() or 'prospecting',
                estimated_amount=float(row['estimated_amount']) if row.get('estimated_amount') and row['estimated_amount'].strip() else None,
                probability=int(row['probability']) if row.get('probability') and row['probability'].strip() else None,
                expected_close_date=row.get('expected_close_date', '').strip() or None,
                sales_person_id=user_id,  # インポート実行ユーザーを営業担当者として設定
                notes=row.get('notes', '').strip() or None,
            )

            # データベースに登録
            crud.crud_deal.create(db, obj_in=deal_data)
            imported += 1

        except Exception as e:
            errors.append(f"行{idx}: データ登録エラー - {str(e)}")
            failed += 1

    return {
        'success': True,
        'imported': imported,
        'failed': failed,
        'errors': errors,
        'total': len(rows)
    }
