"""
データエクスポート用ユーティリティ
"""
import csv
import io
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse


def export_to_csv(data: List[Dict[str, Any]], filename: str, headers: List[str]) -> StreamingResponse:
    """
    データをCSV形式でエクスポート

    Args:
        data: エクスポートするデータのリスト
        filename: ダウンロードファイル名
        headers: CSVヘッダー（カラム名）

    Returns:
        StreamingResponse: CSVファイルのレスポンス
    """
    # CSV用のメモリバッファを作成
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction='ignore')

    # ヘッダーを書き込み
    writer.writeheader()

    # データを書き込み
    for row in data:
        # Noneの値を空文字列に変換
        cleaned_row = {k: (v if v is not None else '') for k, v in row.items() if k in headers}
        writer.writerow(cleaned_row)

    # バッファの先頭に移動
    output.seek(0)

    # StreamingResponseを作成
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8-sig"  # UTF-8 BOM for Excel compatibility
        }
    )


def convert_to_dict_list(objects: List[Any]) -> List[Dict[str, Any]]:
    """
    SQLAlchemyモデルオブジェクトのリストを辞書のリストに変換

    Args:
        objects: SQLAlchemyモデルオブジェクトのリスト

    Returns:
        辞書のリスト
    """
    result = []
    for obj in objects:
        if hasattr(obj, '__dict__'):
            # SQLAlchemyオブジェクトの場合
            obj_dict = {
                key: value for key, value in obj.__dict__.items()
                if not key.startswith('_')
            }
            result.append(obj_dict)
        elif isinstance(obj, dict):
            # 既に辞書の場合
            result.append(obj)
    return result
