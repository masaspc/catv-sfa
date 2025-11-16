# CATV事業者向けSFA（営業支援システム）

## プロジェクト概要

Tokyo Bay Net向けのCATV事業者専用営業支援WEBシステムです。
営業活動のリアルタイム可視化、集合住宅の効率的な営業管理、データに基づく営業戦略の立案を実現します。

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** (グラフ表示)
- **React Leaflet** (地図表示)
- **Zustand** (状態管理)
- **PWA対応** (オフライン機能)

### バックエンド
- **Python 3.11** + **FastAPI**
- **SQLAlchemy** (ORM)
- **PostgreSQL** (データベース)
- **JWT** (認証)
- **Alembic** (マイグレーション)

### インフラ
- **本番環境**: Azure App Service / Azure Database for PostgreSQL
- **テスト環境（無料）**: Vercel + Render + PostgreSQL

## プロジェクト構成

```
catv-sfa/
├── backend/              # FastAPI バックエンド
│   ├── app/
│   │   ├── api/         # APIエンドポイント
│   │   ├── core/        # 設定・セキュリティ
│   │   ├── db/          # データベース接続
│   │   ├── models/      # SQLAlchemyモデル
│   │   ├── schemas/     # Pydanticスキーマ
│   │   ├── crud/        # CRUD操作
│   │   └── services/    # ビジネスロジック
│   ├── alembic/         # マイグレーション
│   ├── tests/           # テストコード
│   └── requirements.txt
├── frontend/            # Next.js フロントエンド
│   ├── app/            # App Router
│   ├── components/     # Reactコンポーネント
│   ├── lib/            # ユーティリティ
│   ├── public/         # 静的ファイル
│   └── package.json
├── docs/               # ドキュメント
├── scripts/            # セットアップスクリプト
├── docker-compose.yml  # ローカル開発環境
└── README.md
```

## セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 18以降
- Python 3.11以降

### ローカル開発環境の起動

1. リポジトリのクローン
```bash
git clone <repository-url>
cd catv-sfa
```

2. 環境変数の設定
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

3. Dockerコンテナの起動
```bash
docker-compose up -d
```

4. データベースマイグレーション
```bash
docker-compose exec backend alembic upgrade head
```

5. アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## デプロイ（本番・テスト環境）

### ⭐ Azure デプロイ（推奨）

**30分で構築完了** - Azure上に安定した環境を構築できます。

**📖 クイックスタート**: [`AZURE_QUICK_START.md`](AZURE_QUICK_START.md)
**📚 詳細ガイド**: [`docs/AZURE_DEPLOYMENT.md`](docs/AZURE_DEPLOYMENT.md)

**サービス構成**:
- フロントエンド: **Azure Static Web Apps**（無料）
- バックエンド: **Azure App Service**（Free F1 または Basic B1）
- データベース: **Azure Database for PostgreSQL**（Burstable B1ms）

**コスト**:
- **最小構成**（テスト用）: 約1,500円/月
- **推奨構成**（本番用）: 約3,000円/月

**メリット**:
- ✅ シンプルな設定
- ✅ 24時間安定稼働
- ✅ Azure Portal で一元管理
- ✅ 本番環境にも対応

**3ステップでデプロイ**:
1. Azure Database for PostgreSQL を作成
2. Azure App Service でバックエンドをデプロイ
3. Azure Static Web Apps でフロントエンドをデプロイ

---

### 🆓 完全無料プラン（代替案）

Vercel + Render を使用した完全無料のテスト環境も構築可能です。

**デプロイ手順**: [`docs/DEPLOYMENT_FREE.md`](docs/DEPLOYMENT_FREE.md)

**制限事項**:
- Renderは15分非アクティブでスリープ
- 設定がやや複雑
- データベースは90日後に削除

## 開発ガイド

### バックエンド開発

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### フロントエンド開発

```bash
cd frontend
npm install
npm run dev
```

### テスト実行

```bash
# バックエンド
cd backend
pytest

# フロントエンド
cd frontend
npm test
```

## 開発フェーズ

- [x] **Phase 1: 基盤構築** - 認証、ユーザー管理、基本UI
- [ ] **Phase 2: コア機能実装** - 顧客管理、案件管理、営業活動管理
- [ ] **Phase 3: 集合住宅特化機能** - 物件管理、提案支援
- [ ] **Phase 4: ダッシュボード・分析** - グラフィカルダッシュボード、レポート
- [ ] **Phase 5: テスト・デプロイ** - Azureデプロイ、パフォーマンス最適化

## 主要機能

### 営業員向け（モバイル最適化）
- ダッシュボード（今日の予定・目標達成状況）
- 顧客管理（個人・集合住宅）
- 案件管理（営業フェーズ管理）
- 日報入力（音声入力対応）
- 訪問予定・実績管理（地図表示）

### 管理者向け（PC最適化）
- 総合ダッシュボード（KPI、グラフ）
- 営業成績一覧・分析
- 集合住宅分析（導入率、エリア別）
- レポート作成・出力
- マスタ管理・ユーザー管理

## ライセンス

Proprietary - Tokyo Bay Net

## お問い合わせ

Tokyo Bay Net システム開発チーム
