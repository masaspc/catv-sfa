#!/usr/bin/env python3
"""
初期データ投入スクリプト
"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.base import SessionLocal
from app.db.init_db import init_db


def main():
    db = SessionLocal()
    try:
        init_db(db)
        print("初期データの投入が完了しました")
    finally:
        db.close()


if __name__ == "__main__":
    main()
