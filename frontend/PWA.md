# PWA (Progressive Web App) 対応

CATV SFAシステムはPWA（Progressive Web App）として動作し、ネイティブアプリのような体験を提供します。

## 主な機能

### 1. ホーム画面へのインストール

#### モバイル端末（iOS/Android）
- **Chrome (Android)**:
  1. Chromeでアプリにアクセス
  2. メニュー (⋮) から「ホーム画面に追加」を選択
  3. アプリ名を確認して「追加」をタップ
  4. ホーム画面にアイコンが追加されます

- **Safari (iOS)**:
  1. Safariでアプリにアクセス
  2. 共有ボタン (□↑) をタップ
  3. 「ホーム画面に追加」を選択
  4. アプリ名を確認して「追加」をタップ

#### デスクトップ（Chrome/Edge）
1. ブラウザでアプリにアクセス
2. アドレスバー右側のインストールアイコン（⊕）をクリック
3. 「インストール」をクリック
4. アプリがスタンドアロンウィンドウで開きます

### 2. オフライン機能

Service Workerによるキャッシュ戦略を実装しています：

- **静的リソース**: Cache First戦略
  - 一度読み込んだページやアセットはキャッシュから高速表示
  - ネットワークが利用できない場合もキャッシュから表示

- **APIリクエスト**: Network First戦略
  - 常に最新データの取得を試みる
  - ネットワークエラー時はキャッシュされたデータを表示
  - 完全オフライン時は適切なエラーメッセージを表示

- **オフラインページ**:
  - ネットワーク接続がない場合、専用のオフラインページを表示
  - オンライン復帰を自動検知してリダイレクト

### 3. キャッシュ対象

以下のページとリソースが自動的にキャッシュされます：
- トップページ (/)
- ダッシュボード (/dashboard)
- 顧客一覧 (/customers)
- 案件一覧 (/deals)
- 営業活動一覧 (/activities)
- 日報一覧 (/daily-reports)
- オフラインページ (/offline)
- マニフェストとアイコン

### 4. 自動更新

新しいバージョンが利用可能になると：
1. Service Workerが自動的に新バージョンを検出
2. ユーザーに更新通知を表示
3. 確認後、ページをリロードして最新版を適用

## 開発者向け情報

### ファイル構成

```
frontend/
├── public/
│   ├── manifest.json        # PWAマニフェスト
│   ├── icon.svg             # アプリアイコン
│   └── sw.js                # Service Worker
├── app/
│   ├── layout.tsx           # PWAメタタグ設定
│   └── offline/
│       └── page.tsx         # オフラインページ
└── components/
    └── pwa-register.tsx     # Service Worker登録
```

### Service Worker バージョン管理

Service Workerのキャッシュバージョンは `sw.js` 内の以下の定数で管理：

```javascript
const CACHE_NAME = 'catv-sfa-v1';
const API_CACHE_NAME = 'catv-sfa-api-v1';
```

重要な変更がある場合はバージョン番号を更新してください。

### キャッシュクリア

開発中にキャッシュをクリアしたい場合：

1. **ブラウザのDevTools**:
   - Application タブ → Service Workers → Unregister
   - Application タブ → Storage → Clear site data

2. **プログラムから**:
   ```javascript
   // Service Workerにメッセージを送信
   navigator.serviceWorker.controller?.postMessage({
     type: 'CLEAR_CACHE'
   });
   ```

### 本番環境での注意事項

1. **HTTPS必須**: PWAはHTTPS環境でのみ動作します（localhostを除く）
2. **Service Worker登録**: 本番環境でのみService Workerを登録するよう設定済み
3. **アイコン**: 本番環境では192x192と512x512のPNG画像を用意することを推奨

### テスト方法

1. **Lighthouse監査**:
   ```bash
   # Chrome DevTools → Lighthouse → PWA
   ```

2. **オフラインテスト**:
   - Chrome DevTools → Network → Offline
   - アプリの動作を確認

3. **インストール可能性**:
   - Chrome DevTools → Application → Manifest
   - インストール基準を満たしているか確認

## トラブルシューティング

### Service Workerが登録されない
- 本番ビルド (`npm run build && npm start`) で確認
- HTTPSまたはlocalhostで実行していることを確認

### キャッシュが更新されない
- Service Workerのバージョンを確認
- ブラウザのハードリロード (Ctrl+Shift+R / Cmd+Shift+R)
- Service Workerを手動でunregisterして再読み込み

### オフライン機能が動作しない
- Service Workerが正しく登録されているか確認
- キャッシュにページが保存されているか確認 (DevTools → Application → Cache Storage)

## 今後の拡張予定

- [ ] プッシュ通知機能
- [ ] バックグラウンド同期
- [ ] より高度なオフライン対応（データ編集のキューイング）
- [ ] アプリショートカット機能
