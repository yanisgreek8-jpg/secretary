var C='secretary-v2';
var ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){if(k!==C)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var req=e.request;
  // HTML — всегда свежий из сети, офлайн откатываемся в кэш
  if(req.mode==='navigate'||(req.destination==='document')){
    e.respondWith(
      fetch(req).then(function(resp){var cp=resp.clone();caches.open(C).then(function(c){c.put('index.html',cp);});return resp;})
      .catch(function(){return caches.match('index.html');})
    );
    return;
  }
  // остальное — из кэша, иначе сеть
  e.respondWith(
    caches.match(req).then(function(r){
      return r||fetch(req).then(function(resp){var cp=resp.clone();caches.open(C).then(function(c){c.put(req,cp);});return resp;});
    })
  );
});
