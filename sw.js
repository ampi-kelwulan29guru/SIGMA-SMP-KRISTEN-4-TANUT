const CACHE_NAME = 'sigma-edu-v1';

// Daftar asset menggunakan path relatif agar cocok untuk GitHub Pages
const ASSETS = [
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

// Simpan file ke memori (Cache Storage) saat install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Jalankan secara offline dengan mengambil data dari cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
