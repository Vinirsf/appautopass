const CACHE_NAME = 'lava-rapido-cache-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
    console.log('Service Worker instalado');
});

self.addEventListener('fetch', (e) => {
    console.log('Service Worker interceptou:', e.request.url);
});
