const cacheName = '3501-pwa-cache-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/images/RID3501_Logo.png',
  '/images/apple-touch-icon.png',
  '/styles.css'
];

// 安裝 Service Worker 並緩存靜態資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching static assets');
      return cache.addAll(assetsToCache);
    })
  );
});

// 啟用 Service Worker 並清理舊的緩存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== cacheName) {
            console.log('Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 攔截網路請求，緩存 API 資料
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 檢查是否為行事曆 API 的請求
  if (url.origin === 'https://www.googleapis.com') {
    event.respondWith(
      caches.open(cacheName).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone()); // 緩存 API 響應
            return networkResponse;
          });
        });
      })
    );
  } else {
    // 對於其他請求，使用預設的緩存邏輯
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
