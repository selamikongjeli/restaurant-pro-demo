const CACHE='restaurant-pro-github-v235-20261009';
const ASSETS=['./','./index.html','./style.css?v=235','./app.js?v=235','./manifest.webmanifest'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(e.request.method==='GET'){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
