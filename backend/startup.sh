#!/bin/bash

# Azureスタートアップスクリプト

echo "Starting CATV SFA Backend..."

# マイグレーション実行
echo "Running database migrations..."
alembic upgrade head

# 初期データ投入
echo "Initializing database..."
python scripts/init_data.py

# アプリケーション起動
echo "Starting application..."
gunicorn app.main:app --workers 2 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
