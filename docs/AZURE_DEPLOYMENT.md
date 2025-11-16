# Azureデプロイガイド（CATV SFA System）

このガイドでは、Azure上にCATV SFAシステムを**簡単に**デプロイする手順を説明します。

## 💰 コスト見積もり

| サービス | プラン | 月額コスト（目安） |
|---------|--------|------------------|
| **Azure App Service** | Free (F1) | **0円** |
| **Azure Database for PostgreSQL** | Burstable B1ms | **約1,500円** |
| **合計** | - | **約1,500円/月** |

> ⚠️ **注意**: Azure App Serviceの無料プラン（F1）は性能制限がありますが、テスト用途には十分です。

---

## 📋 前提条件

- Azureアカウント（無料で作成可能）
- Azure CLI インストール済み（またはAzure Cloud Shell使用）
- GitHubアカウント

---

## 🚀 デプロイ手順（3つのステップ）

### **ステップ1: Azureアカウントとリソースグループの準備**

#### 1-1. Azureアカウント作成

https://azure.microsoft.com/ja-jp/free/ にアクセスして無料アカウントを作成します。

- 12ヶ月間の無料サービス
- ¥25,400 分のクレジット（30日間）

#### 1-2. Azure Portalにログイン

https://portal.azure.com にアクセスしてログインします。

#### 1-3. リソースグループを作成

1. Azure Portalで「**リソースグループ**」を検索
2. 「**+ 作成**」をクリック
3. 以下を入力：
   - **リソースグループ名**: `catv-sfa-rg`
   - **リージョン**: `Japan East`（東日本）
4. 「**確認および作成**」→「**作成**」

---

### **ステップ2: Azure Database for PostgreSQL の作成**

#### 2-1. データベースサーバーを作成

1. Azure Portalで「**Azure Database for PostgreSQL**」を検索
2. 「**+ 作成**」→「**フレキシブル サーバー**」を選択
3. 基本設定：
   - **リソースグループ**: `catv-sfa-rg`
   - **サーバー名**: `catv-sfa-db`（ユニークな名前が必要）
   - **リージョン**: `Japan East`
   - **PostgreSQLバージョン**: `15`
   - **ワークロードタイプ**: `開発`

4. コンピューティングとストレージ:
   - **コンピューティングレベル**: `Burstable`
   - **コンピューティングサイズ**: `B1ms`（最小）
   - **ストレージ**: `32 GiB`（最小）

5. 認証:
   - **管理者ユーザー名**: `catv_admin`
   - **パスワード**: 強力なパスワードを設定（**必ずメモ**）

6. ネットワーク:
   - **パブリックアクセス**を許可
   - 「**現在のクライアントIPアドレスの追加**」にチェック
   - 「**Azureサービスへのパブリックアクセスの許可**」にチェック

7. 「**確認および作成**」→「**作成**」

⏱️ **作成に5〜10分かかります**

#### 2-2. データベースを作成

1. 作成したPostgreSQLサーバーを開く
2. 左メニューの「**データベース**」をクリック
3. 「**+ 追加**」をクリック
4. データベース名: `catv_sfa_db`
5. 「**保存**」

#### 2-3. 接続文字列を取得

1. PostgreSQLサーバーのページで「**接続文字列**」をクリック
2. 「**ADO.NET**」タブの文字列をコピー
3. 以下の形式に変換：

```
元の形式（ADO.NET）:
Server=catv-sfa-db.postgres.database.azure.com;Database=catv_sfa_db;Port=5432;User Id=catv_admin;Password={your_password};Ssl Mode=Require;

PostgreSQL形式に変換:
postgresql://catv_admin:{your_password}@catv-sfa-db.postgres.database.azure.com:5432/catv_sfa_db?sslmode=require
```

⚠️ **重要**: `{your_password}` を実際のパスワードに置き換えてください。
この接続文字列を**メモ帳などに保存**（後で使用）

---

### **ステップ3: Azure App Service でバックエンドをデプロイ**

#### 3-1. App Serviceを作成

1. Azure Portalで「**App Service**」を検索
2. 「**+ 作成**」→「**Web App**」を選択
3. 基本設定：
   - **リソースグループ**: `catv-sfa-rg`
   - **名前**: `catv-sfa-backend`（ユニークな名前が必要）
   - **公開**: `コード`
   - **ランタイムスタック**: `Python 3.11`
   - **オペレーティングシステム**: `Linux`
   - **リージョン**: `Japan East`

4. App Service プラン:
   - **Linux プラン**: 新規作成
   - **価格プラン**: `Free F1`（無料）または `Basic B1`（約1,500円/月）

5. 「**確認および作成**」→「**作成**」

#### 3-2. デプロイセンターでGitHub連携

1. 作成したApp Serviceを開く
2. 左メニューの「**デプロイ センター**」をクリック
3. ソース: 「**GitHub**」を選択
4. GitHubアカウントを承認
5. 以下を選択：
   - **組織**: あなたのGitHubアカウント
   - **リポジトリ**: `catv-sfa`
   - **ブランチ**: `claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8` または `main`

6. 「**保存**」をクリック

⏱️ **初回デプロイに10〜15分かかります**

#### 3-3. アプリケーション設定（環境変数）

1. App Serviceページの左メニューで「**構成**」をクリック
2. 「**アプリケーション設定**」タブで以下を追加：

| 名前 | 値 |
|------|-----|
| `DATABASE_URL` | `postgresql://catv_admin:{password}@catv-sfa-db.postgres.database.azure.com:5432/catv_sfa_db?sslmode=require` |
| `SECRET_KEY` | ランダムな文字列（例: `openssl rand -hex 32` で生成） |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `BACKEND_CORS_ORIGINS` | `["*"]`（後で更新） |
| `FIRST_SUPERUSER_EMAIL` | `admin@tokyobaynet.com` |
| `FIRST_SUPERUSER_PASSWORD` | `admin123` |
| `FIRST_SUPERUSER_USERNAME` | `admin` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_HTTPLOGGING_RETENTION_DAYS` | `7` |

3. 「**保存**」をクリック

#### 3-4. スタートアップコマンドを設定

1. 「**構成**」ページの「**全般設定**」タブをクリック
2. 「**スタートアップ コマンド**」に以下を入力：

```bash
bash backend/startup.sh
```

3. 「**保存**」

#### 3-5. デプロイ完了確認

1. App Serviceページの「**概要**」をクリック
2. **URL**をクリック（例: `https://catv-sfa-backend.azurewebsites.net`）
3. JSONレスポンスが表示されればOK：
   ```json
   {
     "message": "CATV SFA System API",
     "version": "1.0.0",
     "docs": "/docs"
   }
   ```

4. API ドキュメントを確認：
   - `https://catv-sfa-backend.azurewebsites.net/docs`

バックエンドのURLを**メモ**（フロントエンドで使用）

---

### **ステップ4: Azure Static Web Apps でフロントエンドをデプロイ**

#### 4-1. Static Web Appを作成

1. Azure Portalで「**Static Web Apps**」を検索
2. 「**+ 作成**」をクリック
3. 基本設定：
   - **リソースグループ**: `catv-sfa-rg`
   - **名前**: `catv-sfa-frontend`
   - **プランタイプ**: `Free`（無料）
   - **リージョン**: `East Asia`

4. デプロイの詳細:
   - **ソース**: `GitHub`
   - GitHubアカウントを承認
   - **組織**: あなたのGitHubアカウント
   - **リポジトリ**: `catv-sfa`
   - **ブランチ**: `claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8` または `main`

5. ビルドの詳細:
   - **ビルドプリセット**: `Next.js`
   - **アプリの場所**: `/frontend`
   - **APIの場所**: （空欄）
   - **出力場所**: `.next`

6. 「**確認および作成**」→「**作成**」

#### 4-2. 環境変数を設定

1. 作成したStatic Web Appを開く
2. 左メニューの「**構成**」をクリック
3. 「**アプリケーション設定**」タブで以下を追加：

| 名前 | 値 |
|------|-----|
| `NEXT_PUBLIC_API_URL` | `https://catv-sfa-backend.azurewebsites.net/api/v1` |

4. 「**保存**」

#### 4-3. 再デプロイ

1. GitHubリポジトリに移動
2. **Actions** タブを開く
3. 最新のワークフローを選択
4. 「**Re-run all jobs**」で再デプロイ

⏱️ **デプロイに5〜10分かかります**

#### 4-4. フロントエンドURLを確認

1. Static Web Appページの「**概要**」をクリック
2. **URL**をコピー（例: `https://catv-sfa-frontend.azurestaticapps.net`）

---

### **ステップ5: CORS設定を更新**

1. App Service（バックエンド）の「**構成**」を開く
2. `BACKEND_CORS_ORIGINS` を編集：

```json
["https://catv-sfa-frontend.azurestaticapps.net","http://localhost:3000"]
```

3. 「**保存**」→ 再起動

---

## ✅ デプロイ完了確認

### 1. フロントエンドにアクセス

Static Web AppsのURLにアクセス：
```
https://catv-sfa-frontend.azurestaticapps.net
```

### 2. ログインテスト

1. **「ログイン」**ボタンをクリック
2. 以下でログイン：
   - **ユーザー名**: `admin`
   - **パスワード**: `admin123`

3. ダッシュボードが表示されれば**成功**！

---

## 🎉 デプロイ完了！

### 📱 アクセスURL

- **フロントエンド**: https://catv-sfa-frontend.azurestaticapps.net
- **バックエンドAPI**: https://catv-sfa-backend.azurewebsites.net
- **APIドキュメント**: https://catv-sfa-backend.azurewebsites.net/docs

### 🔐 ログイン情報

- **ユーザー名**: `admin`
- **パスワード**: `admin123`

---

## 🔧 トラブルシューティング

### 問題1: バックエンドが500エラー

**原因**: データベース接続エラー

**解決策**:
1. App Serviceの「**ログストリーム**」でエラーを確認
2. DATABASE_URLが正しいか確認
3. PostgreSQLのファイアウォール設定を確認

### 問題2: フロントエンドがAPIに接続できない

**原因**: CORS設定が間違っている

**解決策**:
1. BACKEND_CORS_ORIGINS に正しいフロントエンドURLが含まれているか確認
2. App Serviceを再起動

### 問題3: デプロイが失敗する

**解決策**:
1. GitHubのActions タブでログを確認
2. App Serviceの「デプロイ センター」→「ログ」を確認

---

## 💡 コスト削減のヒント

### 無料プランで運用（App Service F1使用）

- ✅ テスト用途に最適
- ⚠️ 1日の実行時間制限: 60分
- ⚠️ メモリ: 1GB

### 最小コストで運用（App Service B1使用）

- ✅ 24時間稼働
- ✅ カスタムドメイン対応
- 💰 月額: 約1,500円（App Service） + 約1,500円（PostgreSQL） = **約3,000円**

---

## 📞 サポート

問題が発生した場合：

1. App Serviceの「**ログストリーム**」を確認
2. GitHubの「**Actions**」タブでビルドログを確認
3. `docs/SETUP.md` でローカル開発環境の構築方法を確認

---

**デプロイ完了おめでとうございます！** 🎉

Azureで安定したCATV SFAシステムが稼働しています。
