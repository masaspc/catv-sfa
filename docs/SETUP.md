# CATV SFA System セットアップガイド

## 前提条件

- Docker & Docker Compose インストール済み
- Git インストール済み
- （オプション）Node.js 18以降、Python 3.11以降

## クイックスタート（Docker使用）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd catv-sfa
```

### 2. 環境変数の設定

```bash
# バックエンド環境変数
cp backend/.env.example backend/.env

# フロントエンド環境変数
cp frontend/.env.local.example frontend/.env.local
```

### 3. Dockerコンテナの起動

```bash
docker-compose up -d
```

初回起動時は自動的に以下が実行されます：
- PostgreSQLデータベースの作成
- データベースマイグレーション
- 初期管理者ユーザーの作成

### 4. アクセス確認

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API ドキュメント**: http://localhost:8000/docs

### 5. ログイン

デフォルト管理者アカウント:
- **ユーザー名**: `admin`
- **パスワード**: `admin123`

## ローカル開発環境（Dockerなし）

### バックエンド開発

```bash
cd backend

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存パッケージインストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .envファイルを編集してDATABASE_URLなどを設定

# データベースマイグレーション
alembic upgrade head

# 初期データ投入
python scripts/init_data.py

# 開発サーバー起動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### フロントエンド開発

```bash
cd frontend

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.local.example .env.local

# 開発サーバー起動
npm run dev
```

## データベースマイグレーション

### 新しいマイグレーションの作成

```bash
cd backend
alembic revision --autogenerate -m "変更内容の説明"
```

### マイグレーションの適用

```bash
alembic upgrade head
```

### マイグレーションのロールバック

```bash
alembic downgrade -1
```

## テストの実行

### バックエンドテスト

```bash
cd backend
pytest
```

### フロントエンドテスト

```bash
cd frontend
npm test
```

## トラブルシューティング

### Dockerコンテナが起動しない

```bash
# ログ確認
docker-compose logs

# コンテナの再構築
docker-compose down
docker-compose up --build
```

### データベース接続エラー

```bash
# データベースコンテナの状態確認
docker-compose ps

# データベースコンテナの再起動
docker-compose restart db
```

### ポートが既に使用されている

```bash
# ポート使用状況確認
# Linux/Mac
lsof -i :8000
lsof -i :3000

# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# docker-compose.ymlでポート番号を変更
```

## 本番環境デプロイ（Azure）

詳細は `docs/AZURE_DEPLOYMENT.md` を参照してください。

### 基本的な手順

1. Azure App Serviceの作成
2. Azure Database for PostgreSQLの作成
3. 環境変数の設定
4. コードのデプロイ
5. データベースマイグレーション実行

## 開発ガイドライン

### コードスタイル

**Python (バックエンド)**
```bash
# コードフォーマット
black .

# リント
flake8
```

**TypeScript (フロントエンド)**
```bash
# リント
npm run lint
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 新機能開発
- `bugfix/*`: バグ修正

### コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

## よくある質問

### Q. パスワードを忘れた場合は？

A. データベースから直接リセットするか、`scripts/reset_password.py`（今後実装予定）を使用してください。

### Q. 新しいユーザーを追加するには？

A. 管理者アカウントでログイン後、ユーザー管理画面から追加できます。

### Q. データベースをリセットするには？

A. 以下のコマンドで完全にリセットできます：

```bash
docker-compose down -v
docker-compose up -d
```

**注意**: すべてのデータが削除されます。

## サポート

問題が発生した場合は、以下をご確認ください：

1. このドキュメント
2. `README.md`
3. GitHubのIssue
4. システム管理者への連絡

---

Last updated: 2025-11-17
