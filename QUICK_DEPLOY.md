# 🚀 クイックデプロイガイド（完全無料プラン）

このガイドに従えば、**30分以内**に完全無料のテスト環境を構築できます。

## ステップ1: アカウント作成（5分）

以下のサービスにサインアップしてください：

### 1-1. Vercel（フロントエンド用）
1. https://vercel.com にアクセス
2. **"Start Deploying"** または **"Sign Up"** をクリック
3. **"Continue with GitHub"** を選択（GitHubアカウントで登録）
4. 権限を許可してサインアップ完了

### 1-2. Render（バックエンド用）
1. https://render.com にアクセス
2. **"Get Started"** をクリック
3. **"GitHub"** を選択してサインアップ
4. 権限を許可してサインアップ完了

---

## ステップ2: Renderでバックエンドをデプロイ（10分）

### 2-1. Blueprintから作成

1. Renderダッシュボードにログイン
2. 左メニューの **"Blueprints"** をクリック
3. 右上の **"New Blueprint Instance"** をクリック

### 2-2. GitHubリポジトリを接続

1. **"Connect a repository"** で、リポジトリを検索
2. `catv-sfa` リポジトリを選択
3. **"Connect"** をクリック

### 2-3. Blueprint設定

1. **Service Group Name**: `catv-sfa` のまま
2. **Branch**: `claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8` または `main` を選択
3. **Blueprint file**: `render.yaml` が自動検出される

### 2-4. デプロイ開始

1. **"Apply"** をクリック
2. 以下が自動的に作成されます：
   - PostgreSQLデータベース
   - FastAPI Webサービス

**⏱️ 待機時間**: 初回デプロイは約5〜10分かかります。

### 2-5. デプロイ状況確認

1. ダッシュボードで **"catv-sfa-backend"** サービスをクリック
2. **"Logs"** タブでデプロイログを確認
3. `Application startup complete` と表示されれば成功

### 2-6. バックエンドURLを確認

1. サービスページの上部に表示されるURLをコピー
   例: `https://catv-sfa-backend-xxxx.onrender.com`
2. このURLを**メモ帳などに保存**（後で使用）

### 2-7. 初期データ投入

1. Renderダッシュボードで **"catv-sfa-backend"** を選択
2. 右上の **"Shell"** ボタンをクリック
3. シェルが開いたら、以下のコマンドを実行：

```bash
cd backend
python scripts/init_data.py
```

4. `管理者ユーザーを作成しました: admin@tokyobaynet.com` と表示されればOK

---

## ステップ3: Vercelでフロントエンドをデプロイ（10分）

### 3-1. 新しいプロジェクトを作成

1. Vercelダッシュボードにログイン
2. **"Add New..."** → **"Project"** をクリック

### 3-2. リポジトリをインポート

1. **"Import Git Repository"** セクションで `catv-sfa` を検索
2. **"Import"** をクリック

### 3-3. プロジェクト設定

**Configure Project** 画面で以下を設定：

| 項目 | 設定値 |
|------|--------|
| **Project Name** | `catv-sfa`（任意の名前でOK） |
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` を選択 |
| **Build Command** | `npm run build`（デフォルト） |
| **Output Directory** | `.next`（デフォルト） |

### 3-4. 環境変数を設定

**Environment Variables** セクションで以下を追加：

1. **Name**: `NEXT_PUBLIC_API_URL`
2. **Value**: `https://catv-sfa-backend-xxxx.onrender.com/api/v1`

   ⚠️ **重要**: `https://catv-sfa-backend-xxxx.onrender.com` の部分を、ステップ2-6でメモしたRenderのURLに置き換えてください。

3. **Environment**: `Production`, `Preview`, `Development` すべてチェック
4. **Add** をクリック

### 3-5. デプロイ開始

1. **"Deploy"** をクリック
2. デプロイが開始されます

**⏱️ 待機時間**: 約2〜3分

### 3-6. デプロイ完了確認

1. `Congratulations!` 画面が表示されたら成功
2. **"Continue to Dashboard"** をクリック
3. デプロイされたURLをクリック
   例: `https://catv-sfa-xxxx.vercel.app`

### 3-7. フロントエンドURLを確認

1. プロジェクトページに表示されるURLをコピー
   例: `https://catv-sfa.vercel.app`
2. このURLを**メモ帳などに保存**（次のステップで使用）

---

## ステップ4: CORS設定を更新（5分）

フロントエンドとバックエンドを接続するため、CORS設定を更新します。

### 4-1. RenderダッシュボードでCORS更新

1. Renderダッシュボードに戻る
2. **"catv-sfa-backend"** サービスを選択
3. 左メニューの **"Environment"** をクリック

### 4-2. BACKEND_CORS_ORIGINS を編集

1. `BACKEND_CORS_ORIGINS` の右にある **"Edit"** をクリック
2. **Value** を以下に変更：

```json
["https://catv-sfa-xxxx.vercel.app","http://localhost:3000"]
```

⚠️ **重要**: `https://catv-sfa-xxxx.vercel.app` の部分を、ステップ3-7でメモしたVercelのURLに置き換えてください。

3. **"Save Changes"** をクリック
4. サービスが自動的に再デプロイされます（1〜2分）

---

## ✅ ステップ5: 動作確認（5分）

### 5-1. フロントエンドにアクセス

VercelのURL（`https://catv-sfa-xxxx.vercel.app`）にアクセスします。

### 5-2. ログインテスト

1. **"ログイン"** ボタンをクリック
2. 以下の情報を入力：
   - **ユーザー名**: `admin`
   - **パスワード**: `admin123`
3. **"ログイン"** をクリック

### 5-3. 成功確認

✅ ダッシュボードが表示されれば**デプロイ成功**です！

### 5-4. APIドキュメント確認（オプション）

RenderのURL（`https://catv-sfa-backend-xxxx.onrender.com/docs`）にアクセスして、FastAPIの自動生成ドキュメントが表示されることを確認します。

---

## 🎉 デプロイ完了！

おめでとうございます！完全無料のCATV SFAシステムが稼働しました。

### 📱 アクセスURL

- **フロントエンド**: https://catv-sfa-xxxx.vercel.app
- **バックエンドAPI**: https://catv-sfa-backend-xxxx.onrender.com
- **APIドキュメント**: https://catv-sfa-backend-xxxx.onrender.com/docs

### 🔐 ログイン情報

- **ユーザー名**: `admin`
- **パスワード**: `admin123`

⚠️ **セキュリティ**: テスト後は必ずパスワードを変更してください。

---

## ⚠️ トラブルシューティング

### 問題1: ログインできない（401エラー）

**原因**: バックエンドがスリープ中、またはCORS設定が間違っている

**解決策**:
1. バックエンドURL（`https://catv-sfa-backend-xxxx.onrender.com`）に直接アクセスして起動を待つ（30秒〜1分）
2. CORS設定が正しいか確認（ステップ4）
3. ブラウザの開発者ツール（F12）でエラーを確認

### 問題2: ページが表示されない（500エラー）

**原因**: バックエンドでエラーが発生している

**解決策**:
1. Renderダッシュボードで **"Logs"** を確認
2. データベース接続エラーの場合は、データベースが正常に作成されているか確認
3. 初期データ投入（ステップ2-7）を再実行

### 問題3: 初回アクセスが遅い

**仕様**: Renderの無料プランは15分間アクセスがないとスリープします。

**対策**:
- 初回アクセス時は30秒〜1分待ってください
- 起動後は通常速度で動作します

### 問題4: 環境変数が反映されない

**解決策**:
1. Vercel/Renderダッシュボードで環境変数を再確認
2. 手動で再デプロイ：
   - **Vercel**: Deployments → 最新デプロイの右の`...` → **Redeploy**
   - **Render**: Manual Deploy → **Deploy latest commit**

---

## 📞 さらにヘルプが必要な場合

詳細なトラブルシューティングは以下を参照：
- `docs/DEPLOYMENT_FREE.md` - 完全なデプロイガイド
- `docs/SETUP.md` - ローカル開発環境のセットアップ
- `README.md` - プロジェクト概要

---

## 🔄 コード更新時の再デプロイ

コードを更新した場合：

```bash
git add .
git commit -m "機能追加"
git push origin main  # または claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8
```

Vercel/Renderが自動的に検出して再デプロイします（5〜10分）。

---

Last updated: 2025-11-17
