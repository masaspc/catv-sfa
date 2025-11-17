// Service Worker for CATV SFA PWA
const CACHE_NAME = 'catv-sfa-v1';
const API_CACHE_NAME = 'catv-sfa-api-v1';

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/customers',
  '/deals',
  '/activities',
  '/daily-reports',
  '/offline',
  '/manifest.json',
  '/icon.svg',
];

// Service Worker インストール時
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS.map(url => new Request(url, { cache: 'reload' })))
        .catch((error) => {
          console.error('[SW] Failed to cache:', error);
          // エラーが発生しても続行
          return Promise.resolve();
        });
    }).then(() => {
      // 新しいService Workerを即座にアクティブ化
      return self.skipWaiting();
    })
  );
});

// Service Worker アクティベーション時
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いキャッシュを削除
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // すべてのクライアントで新しいService Workerを有効化
      return self.clients.claim();
    })
  );
});

// フェッチイベント処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // APIリクエストの処理（Network First）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したレスポンスをキャッシュ
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから返す
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving from API cache:', request.url);
              return cachedResponse;
            }
            // キャッシュもない場合はオフラインページを返す
            return new Response(
              JSON.stringify({ error: 'オフラインです。接続を確認してください。' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({ 'Content-Type': 'application/json' }),
              }
            );
          });
        })
    );
    return;
  }

  // 静的リソースの処理（Cache First）
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
      }

      // キャッシュになければネットワークから取得
      return fetch(request)
        .then((response) => {
          // 有効なレスポンスの場合はキャッシュに保存
          if (
            !response ||
            response.status !== 200 ||
            response.type === 'error'
          ) {
            return response;
          }

          // 同一オリジンのリソースのみキャッシュ
          if (url.origin === location.origin) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch((error) => {
          console.error('[SW] Fetch failed:', error);
          // ナビゲーションリクエストの場合はオフラインページを返す
          if (request.mode === 'navigate') {
            return caches.match('/offline').then((response) => {
              return response || caches.match('/').then((fallback) => {
                return fallback || new Response('オフラインです', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({ 'Content-Type': 'text/html' }),
                });
              });
            });
          }
          throw error;
        });
    })
  );
});

// メッセージイベント処理（キャッシュクリアなど）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
