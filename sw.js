/* Increment this version when changing the PWA shell assets. HTML uses network-first even without a version bump. */
const VERSION = '2026-10-08-quiz-feedback-2';
const CACHE = 'qem-pwa-' + VERSION;
const BASE = new URL('./', self.location.href);
const ASSETS = ['index.html','pwa.js','pwa.css','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const ALLOWED = new Set(ASSETS.map(p => new URL(p, BASE).href));
const HOME = new URL('index.html', BASE).href;
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS.map(p => new Request(new URL(p, BASE).href, {cache:'reload'})));
  })());
});
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Only this app's caches; never delete another GitHub Pages project's cache.
    for(const name of await caches.keys()) if(name.startsWith('qem-pwa-') && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  // Supabase, authentication, RPC, Realtime, videos and all external requests bypass this worker.
  if(request.method !== 'GET' || url.origin !== BASE.origin) return;
  const home = request.mode === 'navigate' && (url.pathname === BASE.pathname || url.pathname === new URL(HOME).pathname);
  url.search = ''; url.hash = '';
  if(!home && !ALLOWED.has(url.href)) return;
  const key = home ? HOME : url.href;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    let timeout;
    const network = fetch(request, {cache:'no-cache'}).then(async response => {
      if(response.ok && response.type === 'basic') await cache.put(key, response.clone()).catch(() => {});
      return response;
    });
    event.waitUntil(network.catch(() => {}));
    try {
      const response = await Promise.race([network, new Promise((_, reject) => { timeout = setTimeout(() => reject(Error('timeout')), 5000); })]);
      if(response.ok) return response;
      return (await cache.match(key)) || response;
    } catch {
      const cached = await cache.match(key);
      if(cached) return cached;
      return new Response(home ? '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Química em Missão</title><h1>Você está sem conexão</h1><p>Conecte-se à internet para abrir o site pela primeira vez.</p></html>' : 'Recurso indisponível offline.', {status:503,headers:{'Content-Type':home?'text/html; charset=utf-8':'text/plain; charset=utf-8'}});
    } finally { clearTimeout(timeout); }
  })());
});
