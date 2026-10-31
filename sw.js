const C="galapagos-v25",T="galapagos-mappa",MAXT=1500,SHELL=["./","./index.html","./manifest.webmanifest","./icon.svg","./icon-180.png","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))));self.clients.claim()});
let pota=0;
async function riduci(){const c=await caches.open(T),k=await c.keys(),n=k.length-MAXT;for(let i=0;i<n;i++)await c.delete(k[i])}
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  // Mappa: tasselli OpenStreetMap e libreria Leaflet, prima dalla memoria (restano tra un aggiornamento e l'altro)
  if(u.hostname==="tile.openstreetmap.org"||(u.hostname==="cdnjs.cloudflare.com"&&u.pathname.includes("/leaflet/"))){
    e.respondWith(caches.open(T).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
      if(r.ok){c.put(e.request,r.clone());if(++pota%50===0)riduci()}return r}))));
    return;
  }
  if(u.hostname==="www.gstatic.com"||u.origin===location.origin){
    e.respondWith(caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(r=>{if(r.ok)caches.open(C).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>hit||Response.error());
      return hit||net;
    }));
  }
});
