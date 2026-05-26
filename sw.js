const CACHE = 'ascension-v3';
const URLS  = [
  '/ascension-protocol/',
  '/ascension-protocol/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/ascension-protocol/index.html')))
  );
});

// Notif programmée reçue depuis la page
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    const { title, body, delay } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon:  '/ascension-protocol/icon.png',
        badge: '/ascension-protocol/icon.png',
        vibrate: [200, 100, 200],
        tag: title,
        renotify: false,
      });
    }, delay);
  }
});

// Clic sur une notif → ouvre l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/ascension-protocol/');
    })
  );
});
