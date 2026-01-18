const CACHE_NAME = '112-asistan-v36-css-clean';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './img/logo.jpg',
  './img/ant.jpg',
  './img/nfr.jpg',
  './img/lateralmı.jpg',
  './img/STSEGMENT.JPG',
  './img/ekg1.jpg',
  './img/tp1.jpg',
  './img/tp2.jpg',
  './img/tp3.jpg',
  './img/svt1.jpg',
  './img/af1.jpg',
  './img/vt.jpg',
  './img/polvt.jpg',
  './img/yanik_yuzdesi.jpg',
  './img/yanik_cocuk.jpg',
  './sound/beep.mp3',
  './sound/wheezing.mp3',
  './sound/ronkus.mp3',
  './sound/stridor.mp3',
  './sound/krup.mp3',
  './sound/ronküs.MP3',
  './sound/KABA RALLER .MP3',
  './video/dekompresyon.mp4',
  './video/krikotomi.mp4',
  './video/io.mp4',
  './video/pace.mp4',
  './video/sync.mp4',
  './video/vagal.mp4'
];

// Service Worker yüklendiğinde cache'i güncelle
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache yükleme hatası (bazı dosyalar eksik olabilir):', err);
      });
    })
  );
  self.skipWaiting(); // Yeni SW'yi hemen aktif et
});

// Eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Tüm clientları kontrol altına al
});

// Gelişmiş cache stratejisi: Network-first, fallback to cache
self.addEventListener('fetch', event => {
  // GET istekleri için cache stratejisi uygula
  if (event.request.method === 'GET') {
    // app.js ve ses dosyaları için her zaman network'ten getir (cache bypass)
    if (event.request.url.includes('app.js') || event.request.url.includes('sound/')) {
      event.respondWith(
        fetch(event.request.url + (event.request.url.includes('?') ? '&' : '?') + 'v=' + Date.now())
          .catch(() => caches.match(event.request))
      );
      return;
    }
    
    // Video dosyaları için cache-first stratejisi (hızlı yükleme)
    if (event.request.url.includes('video/')) {
      event.respondWith(
        caches.match(event.request).then(response => {
          if (response) {
            return response; // Cache'den hızlıca döndür
          }
          // Cache'de yoksa network'ten getir ve cache'e kaydet
          return fetch(event.request).then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
        })
      );
      return;
    }
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Başarılı ise cache'e kaydet ve döndür
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network hatası varsa cache'den getir
          return caches.match(event.request).then(response => {
            if (response) {
              return response;
            }
            // Cache'de de yoksa offline sayfası döndür (isteğe bağlı)
            return new Response('Offline - İnternet bağlantınızı kontrol edin', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          });
        })
    );
  }
});