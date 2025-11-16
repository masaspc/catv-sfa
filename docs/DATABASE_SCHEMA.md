# データベーススキーマ設計

## ER図概要

```
Users (ユーザー)
  ├─ Customers (顧客)
  ├─ Properties (集合住宅)
  ├─ Deals (案件)
  ├─ Activities (営業活動)
  └─ DailyReports (日報)

Customers
  └─ Contracts (契約)

Properties
  └─ Contracts (契約)

Deals
  ├─ Customers (参照)
  └─ Properties (参照)

Activities
  ├─ Customers (参照)
  ├─ Properties (参照)
  └─ Deals (参照)
```

## テーブル定義

### Users（ユーザー）

営業員、マネージャー、管理者の情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| username | String(50) | NO | ユーザー名（ユニーク） |
| email | String(255) | NO | メールアドレス（ユニーク） |
| hashed_password | String(255) | NO | ハッシュ化パスワード |
| full_name | String(100) | YES | 氏名 |
| role | Enum | NO | ロール（admin/manager/sales） |
| team_id | Integer | YES | チームID（将来拡張用） |
| is_active | Boolean | NO | アクティブフラグ |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

**インデックス**: username, email

### Customers（個人顧客）

個人顧客の情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| name | String(100) | NO | 氏名 |
| name_kana | String(100) | YES | 氏名カナ |
| phone_primary | String(20) | YES | 電話番号（メイン） |
| phone_secondary | String(20) | YES | 電話番号（サブ） |
| email | String(255) | YES | メールアドレス |
| postal_code | String(10) | YES | 郵便番号 |
| prefecture | String(50) | YES | 都道府県 |
| city | String(100) | YES | 市区町村 |
| address_line1 | String(255) | YES | 住所1 |
| address_line2 | String(255) | YES | 住所2（建物名・部屋番号） |
| birth_date | Date | YES | 生年月日 |
| customer_type | Enum | NO | 顧客区分 |
| sales_person_id | Integer | YES | 担当営業員ID（FK） |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

**Enum - customer_type**:
- `prospect`: 見込客
- `contracted`: 契約者
- `canceled`: 解約者
- `dormant`: 休眠顧客

### Properties（集合住宅）

集合住宅の情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| property_name | String(255) | NO | 物件名 |
| postal_code | String(10) | YES | 郵便番号 |
| prefecture | String(50) | YES | 都道府県 |
| city | String(100) | YES | 市区町村 |
| address_line1 | String(255) | YES | 住所1 |
| address_line2 | String(255) | YES | 住所2 |
| property_type | Enum | YES | 物件種別 |
| total_units | Integer | YES | 総戸数 |
| floors | Integer | YES | 階数 |
| built_year | Integer | YES | 築年 |
| management_type | Enum | YES | 管理形態 |
| management_company_name | String(255) | YES | 管理会社名 |
| management_contact_person | String(100) | YES | 管理会社担当者 |
| management_phone | String(20) | YES | 管理会社電話番号 |
| management_email | String(255) | YES | 管理会社メール |
| owner_name | String(100) | YES | オーナー名 |
| owner_phone | String(20) | YES | オーナー電話番号 |
| owner_email | String(255) | YES | オーナーメール |
| catv_status | Enum | NO | CATV導入状況 |
| sales_status | Enum | NO | 導入検討状況 |
| bulk_contract_service | String(255) | YES | 一括契約サービス内容 |
| facility_fee_monthly | Integer | YES | 施設利用料（月額/戸） |
| contract_start_date | DateTime | YES | 契約開始日 |
| construction_date | DateTime | YES | 工事日 |
| competitor_info | Text | YES | 競合情報 |
| latitude | Float | YES | 緯度 |
| longitude | Float | YES | 経度 |
| notes | Text | YES | メモ |
| sales_person_id | Integer | YES | 担当営業員ID（FK） |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

**Enum - property_type**:
- `owned_mansion`: 分譲マンション
- `rental_mansion`: 賃貸マンション
- `apartment`: アパート
- `company_housing`: 社宅
- `other`: その他

**Enum - catv_status**:
- `not_introduced`: 未導入
- `bulk_contract`: 一括導入済
- `individual_available`: 個別契約可

### Deals（案件）

営業案件の情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| deal_name | String(255) | NO | 案件名 |
| deal_type | Enum | NO | 案件種別 |
| customer_id | Integer | YES | 顧客ID（FK） |
| property_id | Integer | YES | 物件ID（FK） |
| estimated_amount | Integer | YES | 見積金額 |
| probability | Integer | YES | 受注確度（0-100%） |
| phase | String(50) | YES | 営業フェーズ |
| expected_close_date | DateTime | YES | 受注予定日 |
| actual_close_date | DateTime | YES | 実際の受注日 |
| lost_reason | Text | YES | 失注理由 |
| sales_person_id | Integer | YES | 担当営業員ID（FK） |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

**Enum - deal_type**:
- `new_individual`: 新規個人
- `new_corporate`: 新規法人
- `new_property`: 新規集合住宅
- `upsell`: 既存アップセル
- `retention`: リテンション

### Activities（営業活動）

営業活動の記録を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| activity_date | DateTime | NO | 活動日時 |
| activity_type | Enum | NO | 活動種別 |
| customer_id | Integer | YES | 顧客ID（FK） |
| property_id | Integer | YES | 物件ID（FK） |
| deal_id | Integer | YES | 案件ID（FK） |
| content | Text | YES | 活動内容 |
| result | Text | YES | 実施結果 |
| next_action | Text | YES | 次回アクション |
| next_action_date | DateTime | YES | 次回アクション日 |
| attachments | Text | YES | 添付ファイルパス |
| latitude | String(50) | YES | 緯度 |
| longitude | String(50) | YES | 経度 |
| sales_person_id | Integer | YES | 担当営業員ID（FK） |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

**Enum - activity_type**:
- `visit`: 訪問
- `call`: 電話
- `email`: メール
- `meeting`: 打ち合わせ
- `other`: その他

### Contracts（契約）

契約情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| customer_id | Integer | YES | 顧客ID（FK） |
| property_id | Integer | YES | 物件ID（FK） |
| service_type | Enum | NO | サービス種別 |
| plan_name | String(100) | YES | プラン名 |
| monthly_fee | Integer | YES | 月額料金 |
| start_date | DateTime | YES | 開始日 |
| end_date | DateTime | YES | 終了日（解約日） |
| payment_method | Enum | YES | 支払方法 |
| notes | String(500) | YES | メモ |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

### DailyReports（日報）

日報情報を管理

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| id | Integer | NO | 主キー |
| report_date | Date | NO | 日報日付 |
| start_time | Time | YES | 開始時刻 |
| end_time | Time | YES | 終了時刻 |
| visits_count | Integer | NO | 訪問件数 |
| new_contacts_count | Integer | NO | 新規接触件数 |
| deals_count | Integer | NO | 商談件数 |
| orders_count | Integer | NO | 受注件数 |
| content | Text | YES | 活動内容 |
| insights | Text | YES | 気づき・課題 |
| tomorrow_plan | Text | YES | 明日の予定 |
| attachments | Text | YES | 添付ファイルパス |
| sales_person_id | Integer | NO | 担当営業員ID（FK） |
| created_at | DateTime | NO | 作成日時 |
| updated_at | DateTime | YES | 更新日時 |

## リレーション

- Users 1 : N Customers
- Users 1 : N Properties
- Users 1 : N Deals
- Users 1 : N Activities
- Users 1 : N DailyReports
- Customers 1 : N Contracts
- Properties 1 : N Contracts
- Customers 1 : N Deals
- Properties 1 : N Deals
- Customers 1 : N Activities
- Properties 1 : N Activities
- Deals 1 : N Activities

---

Last updated: 2025-11-17
