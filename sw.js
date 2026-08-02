const CACHE_NAME = 'sigma-edu-v2';

// Asset utama yang wajib ada saat pertama kali dibuka
const INITIAL_ASSETS = [
  './',
  './index.html',
  './pages/dashboard.html',
  './pages/guru.html',
  './pages/siswa.html',
  './pages/kelas.html',
  './pages/mapel.html',
  './pages/absensi.html',
  './pages/jurnal.html',
  './pages/nilai.html',
  './css/dashboard.css',
  './js/db.js',
  './js/auth.js',
  './js/dashboard.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// 1. Install & simpan asset dasar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Aktifkan Service Worker langsung
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. Strategi Network First dengan Cache Fallback
// Ambil data terbaru dari jaringan, jika offline langsung ambil dari memori (cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil konek, simpan update-an halaman ke cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari memori cache
        return caches.match(event.request);
      })
  );
});
