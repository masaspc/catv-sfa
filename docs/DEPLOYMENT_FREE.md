# 完全無料プラン デプロイガイド

Vercel + Render + PostgreSQL を使用した完全無料のテスト環境構築手順です。

## 📋 必要なアカウント

以下のサービスにサインアップしてください（すべて無料）：

1. **GitHub** - https://github.com
2. **Vercel** - https://vercel.com （GitHubアカウントでサインアップ推奨）
3. **Render** - https://render.com （GitHubアカウントでサインアップ推奨）

## 🚀 デプロイ手順

### Phase 1: GitHubリポジトリの準備

#### 1. コードをGitHubにプッシュ

```bash
# 既にプッシュ済みの場合はスキップ
git push -u origin claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8
```

もしくは、メインブランチにマージしてからデプロイする場合：

```bash
# mainブランチにマージ（必要に応じて）
git checkout main
git merge claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8
git push origin main
```

---

### Phase 2: Render でバックエンドをデプロイ

#### 1. Render にログイン

https://render.com にアクセスして、GitHubアカウントでログインします。

#### 2. 新しいBlueprint作成

1. ダッシュボードで **"New +"** → **"Blueprint"** をクリック
2. GitHubリポジトリを接続
3. リポジトリを選択: `catv-sfa`
4. ブランチを選択: `main` または `claude/catv-sfa-system-01SPxz61RtHfEXcgubP6j2u8`

Renderが `render.yaml` を自動検出して、以下を作成します：
- PostgreSQLデータベース（無料プラン）
- FastAPI Webサービス（無料プラン）

#### 3. デプロイ完了を待つ

初回デプロイは5〜10分かかります。

#### 4. バックエンドURLを確認

デプロイ完了後、以下のようなURLが発行されます：
```
https://catv-sfa-backend.onrender.com
```

このURLをメモしておきます。

#### 5. 環境変数の確認（オプション）

Renderダッシュボードで以下を確認：
- **Environment** タブで環境変数が正しく設定されているか確認
- 特に `BACKEND_CORS_ORIGINS` を後でVercelのURLに更新する必要があります

#### 6. 初期データの投入

バックエンドのシェルにアクセスして初期データを投入：

1. Renderダッシュボードで **"Shell"** をクリック
2. 以下のコマンドを実行：

```bash
cd backend
python scripts/init_data.py
```

これで管理者ユーザー（admin / admin123）が作成されます。

---

### Phase 3: Vercel でフロントエンドをデプロイ

#### 1. Vercel にログイン

https://vercel.com にアクセスして、GitHubアカウントでログインします。

#### 2. 新しいプロジェクトを作成

1. **"Add New..."** → **"Project"** をクリック
2. GitHubリポジトリをインポート: `catv-sfa`
3. **Root Directory** を `frontend` に設定
4. **Framework Preset** が `Next.js` になっていることを確認

#### 3. 環境変数を設定

**Environment Variables** セクションで以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://catv-sfa-backend.onrender.com/api/v1` |

> ⚠️ `https://catv-sfa-backend.onrender.com` の部分を、Phase 2でメモしたRenderのURLに置き換えてください。

#### 4. デプロイ

**"Deploy"** をクリックしてデプロイを開始します。

#### 5. デプロイ完了を待つ

2〜3分でデプロイが完了します。

#### 6. フロントエンドURLを確認

デプロイ完了後、以下のようなURLが発行されます：
```
https://catv-sfa.vercel.app
```

---

### Phase 4: CORS設定の更新

フロントエンドのURLが確定したら、バックエンドのCORS設定を更新します。

#### 1. RenderダッシュボードでCORS更新

1. Renderダッシュボードで `catv-sfa-backend` サービスを選択
2. **Environment** タブを開く
3. `BACKEND_CORS_ORIGINS` を編集：

```json
["https://catv-sfa.vercel.app","http://localhost:3000"]
```

> ⚠️ `https://catv-sfa.vercel.app` の部分を、実際のVercel URLに置き換えてください。

4. **Save Changes** をクリック
5. サービスが自動的に再デプロイされます（1〜2分）

---

## ✅ デプロイ完了確認

### 1. フロントエンドにアクセス

```
https://catv-sfa.vercel.app
```

ホーム画面が表示されることを確認します。

### 2. ログインテスト

1. **"ログイン"** ボタンをクリック
2. 以下の情報でログイン：
   - **ユーザー名**: `admin`
   - **パスワード**: `admin123`

3. ダッシュボードが表示されればOK！

### 3. APIドキュメント確認

```
https://catv-sfa-backend.onrender.com/docs
```

FastAPIの自動生成ドキュメントが表示されることを確認します。

---

## 🔧 トラブルシューティング

### 問題1: ログインできない

**原因**: CORS設定が正しくない、またはバックエンドがスリープ中

**解決策**:
1. RenderのCORS設定を確認
2. バックエンドURLに直接アクセスして起動を待つ（無料プランは15分非アクティブでスリープします）
3. ブラウザの開発者ツールでエラーを確認

### 問題2: バックエンドが500エラー

**原因**: データベース接続エラー、または初期データ未投入

**解決策**:
1. Renderダッシュボードで **Logs** を確認
2. データベースが正常に作成されているか確認
3. 初期データ投入コマンドを再実行

### 問題3: Renderの無料プランでスリープする

**仕様**: Renderの無料プランは15分間アクセスがないとスリープします

**対策**:
- 初回アクセス時に起動まで30秒〜1分待つ
- テスト時は定期的にアクセスする
- 本格運用する場合は有料プラン（月7ドル〜）を検討

### 問題4: 環境変数が反映されない

**解決策**:
1. Vercel/Renderダッシュボードで環境変数を再確認
2. 環境変数変更後、手動で再デプロイ
   - Vercel: **Deployments** → **Redeploy**
   - Render: **Manual Deploy** → **Deploy latest commit**

---

## 💰 無料プランの制限

### Vercel（フロントエンド）
- ✅ 帯域幅: 100GB/月
- ✅ ビルド時間: 100時間/月
- ✅ デプロイ数: 無制限
- ✅ カスタムドメイン: 対応

### Render（バックエンド）
- ✅ 750時間/月の稼働時間
- ⚠️ 15分非アクティブでスリープ
- ⚠️ 512MB RAM
- ⚠️ 起動に30秒〜1分かかる

### Render PostgreSQL（データベース）
- ✅ 1GBストレージ
- ⚠️ 90日後に削除される（データバックアップ推奨）
- ⚠️ 同時接続数制限あり

---

## 🔄 更新デプロイ

コードを更新した場合：

```bash
# 変更をコミット
git add .
git commit -m "機能追加"
git push origin main

# Vercel/Renderが自動的に検出して再デプロイ
```

---

## 📊 デプロイ後の確認事項

- [ ] フロントエンドにアクセスできる
- [ ] ログインできる
- [ ] ダッシュボードが表示される
- [ ] APIドキュメントにアクセスできる
- [ ] 管理者アカウントでユーザー作成できる

---

## 🎯 次のステップ

1. **セキュリティ強化**
   - 管理者パスワードを変更（`FIRST_SUPERUSER_PASSWORD`）
   - SECRET_KEYを強固なものに変更

2. **カスタムドメイン設定**（オプション）
   - Vercel/Renderでカスタムドメインを設定可能

3. **監視設定**
   - Renderのメール通知を有効化
   - UptimeRobotなどで死活監視（無料）

4. **Phase 2の機能実装**
   - 顧客管理、案件管理などの追加機能を実装

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. Renderのログ: https://dashboard.render.com → サービス選択 → **Logs**
2. Vercelのログ: https://vercel.com → プロジェクト選択 → **Deployments** → **View Function Logs**
3. ブラウザの開発者ツール（F12）でコンソールエラーを確認

---

**デプロイ完了おめでとうございます！** 🎉

完全無料でCATV SFAシステムのテスト環境が稼働しました。
