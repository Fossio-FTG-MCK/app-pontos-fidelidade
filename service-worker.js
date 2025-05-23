const CACHE_NAME = 'v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './layout.html',
  './login-signup-reset.html',
  './pages/offline.html',
  './pages/ajuda.html',
  './pages/compras.html',
  './pages/extrato.html',
  './pages/contato.html',
  './pages/meus-dados.html',
  './pages/parceiros.html',
  './pages/vouchers.html',
  './pages/dashboard.html',
  './pages/ajuda.css',
  './pages/compras.css',
  './pages/extrato.css',
  './pages/contato.css',
  './pages/meus-dados.css',
  './pages/parceiros.css',
  './pages/vouchers.css',
  './pages/dashboard.css',
  './app.js',
  './midias/logo.png', // Adicione o caminho correto para a logo
  // Adicione outros arquivos de mídia conforme necessário
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          return caches.match('./pages/offline.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
