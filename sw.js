const CACHE_NAME = 'sigma-edu-v1';
const ASSETS = [
    '/',
    '/pages/dashboard.html',
    '/pages/guru.html',
    '/css/style.css',
    '/css/dashboard.css',
    '/js/db.js',
    '/js/dashboard.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

// Install Service Worker & Simpan Asset
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

// Jalankan Offline
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
