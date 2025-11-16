# API リファレンス

ベースURL: `http://localhost:8000/api/v1`

## 認証

### POST /auth/login

ログイン（トークン取得）

**リクエスト**:
```json
Content-Type: multipart/form-data

username: string (required)
password: string (required)
```

**レスポンス**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**エラー**:
- 401: 認証失敗
- 400: 無効なユーザー

### POST /auth/test-token

トークン検証

**リクエスト**:
```
Authorization: Bearer {token}
```

**レスポンス**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "管理者",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-11-17T00:00:00Z"
}
```

## ユーザー管理

### GET /users/

ユーザー一覧取得（管理者のみ）

**パラメータ**:
- `skip`: integer (default: 0) - オフセット
- `limit`: integer (default: 100) - 取得件数

**リクエスト**:
```
Authorization: Bearer {token}
```

**レスポンス**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "管理者",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-11-17T00:00:00Z"
  }
]
```

### POST /users/

ユーザー新規作成（管理者のみ）

**リクエスト**:
```json
{
  "username": "sales01",
  "email": "sales01@example.com",
  "password": "password123",
  "full_name": "営業 太郎",
  "role": "sales"
}
```

**レスポンス**:
```json
{
  "id": 2,
  "username": "sales01",
  "email": "sales01@example.com",
  "full_name": "営業 太郎",
  "role": "sales",
  "is_active": true,
  "created_at": "2025-11-17T00:00:00Z"
}
```

### GET /users/me

現在のユーザー情報取得

**リクエスト**:
```
Authorization: Bearer {token}
```

**レスポンス**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "管理者",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-11-17T00:00:00Z"
}
```

### PUT /users/me

現在のユーザー情報更新

**リクエスト**:
```json
{
  "full_name": "新しい名前",
  "email": "newemail@example.com"
}
```

### GET /users/{user_id}

ユーザーIDで取得

**パラメータ**:
- `user_id`: integer - ユーザーID

**権限**:
- 自分の情報: すべてのユーザー
- 他人の情報: 管理者のみ

### PUT /users/{user_id}

ユーザー情報更新（管理者のみ）

**パラメータ**:
- `user_id`: integer - ユーザーID

**リクエスト**:
```json
{
  "full_name": "新しい名前",
  "role": "manager",
  "is_active": false
}
```

## エラーレスポンス

すべてのエラーは以下の形式で返されます:

```json
{
  "detail": "エラーメッセージ"
}
```

**HTTPステータスコード**:
- 200: 成功
- 201: 作成成功
- 400: 不正なリクエスト
- 401: 認証エラー
- 403: 権限不足
- 404: リソースが見つからない
- 422: バリデーションエラー
- 500: サーバーエラー

## 認証ヘッダー

APIリクエストには以下のヘッダーが必要です（ログイン以外）:

```
Authorization: Bearer {access_token}
```

## レート制限

現在、レート制限は実装されていません（今後実装予定）。

## API ドキュメント

インタラクティブなAPIドキュメントは以下で利用可能です:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

Last updated: 2025-11-17
