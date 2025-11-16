# 🚀 Azure クイックスタートガイド（CATV SFA）

**30分でAzure環境を構築**

## 💰 コスト

| プラン | 月額 |
|-------|------|
| **最小構成**（テスト用） | 約1,500円 |
| **推奨構成**（本番用） | 約3,000円 |

---

## 📋 必要なもの

- [ ] Azureアカウント（無料で作成）
- [ ] GitHubアカウント

---

## 🏃 3ステップでデプロイ

### **ステップ1: データベースを作成**（10分）

1. **Azure Portal**（https://portal.azure.com）にログイン

2. **Azure Database for PostgreSQL** を検索 → **作成**

3. 設定：
   ```
   リソースグループ: catv-sfa-rg（新規作成）
   サーバー名: catv-sfa-db（ユニーク名）
   リージョン: Japan East
   PostgreSQLバージョン: 15
   コンピューティング: Burstable B1ms（最小）
   管理者名: catv_admin
   パスワード: （強力なパスワード）★メモ必須
   ネットワーク: パブリックアクセス許可
   ```

4. **作成**をクリック → 5分待機

5. 作成後、「**データベース**」→「**追加**」
   - データベース名: `catv_sfa_db`

6. **接続文字列**をコピーして変換：
   ```
   元: Server=catv-sfa-db.postgres...;Database=...;User Id=catv_admin;Password={pass};

   変換後:
   postgresql://catv_admin:パスワード@catv-sfa-db.postgres.database.azure.com:5432/catv_sfa_db?sslmode=require
   ```
   ★この文字列を**メモ帳に保存**

---

### **ステップ2: バックエンドをデプロイ**（10分）

1. **App Service** を検索 → **Web App作成**

2. 設定：
   ```
   リソースグループ: catv-sfa-rg
   名前: catv-sfa-backend（ユニーク名）
   公開: コード
   ランタイム: Python 3.11
   OS: Linux
   リージョン: Japan East
   プラン: Free F1（テスト用）または Basic B1（本番用）
   ```

3. **作成**をクリック

4. **デプロイ センター** → **GitHub**を選択
   - リポジトリ: `catv-sfa`
   - ブランチ: `main`

5. **構成** → **アプリケーション設定** で以下を追加：

   | 名前 | 値 |
   |------|-----|
   | `DATABASE_URL` | ステップ1でメモした接続文字列 |
   | `SECRET_KEY` | `your-secret-key-change-this-12345` |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
   | `BACKEND_CORS_ORIGINS` | `["*"]` |
   | `FIRST_SUPERUSER_USERNAME` | `admin` |
   | `FIRST_SUPERUSER_PASSWORD` | `admin123` |
   | `FIRST_SUPERUSER_EMAIL` | `admin@example.com` |
   | `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

6. **構成** → **全般設定** → **スタートアップコマンド**：
   ```bash
   bash backend/startup.sh
   ```

7. **保存** → デプロイ完了を待つ（10分）

8. **URLを確認**（例: `https://catv-sfa-backend.azurewebsites.net`）
   - `/docs` にアクセスしてAPIドキュメントが表示されればOK
   - ★このURLを**メモ**

---

### **ステップ3: フロントエンドをデプロイ**（10分）

1. **Static Web Apps** を検索 → **作成**

2. 設定：
   ```
   リソースグループ: catv-sfa-rg
   名前: catv-sfa-frontend
   プラン: Free
   リージョン: East Asia
   ソース: GitHub
   リポジトリ: catv-sfa
   ブランチ: main
   ビルドプリセット: Next.js
   アプリの場所: /frontend
   出力場所: .next
   ```

3. **作成**をクリック

4. **構成** → **アプリケーション設定** で追加：

   | 名前 | 値 |
   |------|-----|
   | `NEXT_PUBLIC_API_URL` | `https://catv-sfa-backend.azurewebsites.net/api/v1` |

   ⚠️ ステップ2でメモしたバックエンドURLに `/api/v1` を追加

5. **保存** → GitHubでActions再実行

6. **URLを確認**（例: `https://catv-sfa-frontend.azurestaticapps.net`）

7. **バックエンドのCORS更新**:
   - App Service → **構成** → `BACKEND_CORS_ORIGINS` を編集：
   ```json
   ["https://catv-sfa-frontend.azurestaticapps.net","http://localhost:3000"]
   ```

---

## ✅ 動作確認

1. フロントエンドURL にアクセス
2. 「**ログイン**」をクリック
3. ユーザー名: `admin` / パスワード: `admin123`
4. ダッシュボードが表示されれば**完了**！🎉

---

## 🆘 トラブルシューティング

### ログインできない

1. バックエンドURL（`/docs`）にアクセスして起動確認
2. App Serviceの「**ログストリーム**」でエラー確認
3. CORS設定が正しいか確認

### 500エラー

1. DATABASE_URLが正しいか確認
2. PostgreSQLのファイアウォールで「Azureサービスを許可」にチェック
3. App Serviceを再起動

---

## 📞 詳細ガイド

より詳しい手順は [`docs/AZURE_DEPLOYMENT.md`](docs/AZURE_DEPLOYMENT.md) を参照してください。

---

**お疲れ様でした！** Azureでの構築が完了しました 🎉
