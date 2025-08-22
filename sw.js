const CACHE = 'uaipg-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const accept = req.headers.get('accept') || '';
  // HTML: network-first
  if (accept.includes('text/html')) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match(req)));
    return;
  }
  // Others: cache-first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }))
  );
});
self.addEventListener('push', e => {
  let data = {}; try { data = e.data?.json() || {}; } catch {}
  const title = data.title || 'UAIPG';
  const body  = data.body  || 'Push message';
  e.waitUntil(self.registration.showNotification(title, { body }));
});
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'LOCAL_NOTIFY') {
    self.registration.showNotification(d.title || 'UAIPG', { body: d.body || 'Hello!' });
  }
});
