const CACHE_NAME = 'sigma-edu-v1';

// Daftar file yang disimpan di memori HP/Laptop agar bisa buka Offline
const urlsToCache = [
  '/',
  '/index.html',
  '/pages/login.html',
  '/pages/dashboard.html',
  '/pages/absensi.html',
  '/pages/siswa.html',
  '/pages/guru.html',
  '/pages/nilai.html',
  '/pages/jurnal.html',
  '/pages/mapel.html',
  '/pages/kelas.html',
  '/logo-sekolah.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css'
];

// Process Install Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan file aplikasi untuk mode Offline...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetching Data dari Cache saat Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Mengembalikan file dari cache jika ada, jika tidak ambil dari jaringan
      return response || fetch(event.request);
    })
  );
});

// Hapus cache lama jika ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
