const CACHE='restaurant-pro-github-v215-20261002';
const ASSETS=['./','./index.html','./style.css?v=215','./app.js?v=215','./manifest.webmanifest'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(fetch(event.request).then(r=>{if(event.request.method==='GET'){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(event.request,c))}return r}).catch(()=>caches.match(event.request)));
});
