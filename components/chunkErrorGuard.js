// Inline, dependency-free guard that runs before any application chunk.
//
// If a /_next/static chunk fails to load — typically when the installed PWA is
// opened offline on a route whose code was never cached — React never boots and
// even the error boundaries (which are themselves chunks) cannot render, so
// Next.js shows a bare white "Application error: a client-side exception has
// occurred" screen with no way to recover.
//
// This script registers capture-phase listeners up front, detects a failed
// chunk/stylesheet load, and replaces the page with a self-contained offline
// screen that actively probes the network and reloads itself the moment the
// connection returns. It needs no chunks, CSS, or React, so it works even when
// nothing else can load.
const GUARD_SCRIPT = `(function(){
if(window.__vcChunkGuard)return;window.__vcChunkGuard=1;
var done=false;
function recover(){
if(done)return;done=true;
try{
document.documentElement.style.background="#07080c";
document.body.innerHTML='<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#07080c;color:#f8f8f8;text-align:center;padding:24px"><div style="max-width:30rem"><div style="font-size:34px;margin-bottom:12px">&#128225;</div><h1 style="font-size:1.4rem;margin:0 0 .5rem;font-weight:800">You are offline</h1><p style="color:#a3a3a3;line-height:1.6;margin:0">Part of the app could not load. This screen reloads itself automatically the moment your connection returns.</p><button id="vcRetry" style="margin-top:22px;padding:12px 24px;border:0;border-radius:999px;background:#b91c1c;color:#fff;font-weight:700;font-size:1rem">Try again</button></div></div>';
var btn=document.getElementById("vcRetry");if(btn)btn.addEventListener("click",function(){location.reload()});
}catch(e){}
var busy=false;
function probe(){
if(busy)return;busy=true;
fetch("/manifest.json?_p="+Date.now(),{cache:"no-store"}).then(function(r){if(r&&r.ok){location.reload()}else{busy=false}}).catch(function(){busy=false});
}
window.addEventListener("online",probe);
setInterval(probe,3000);
setTimeout(probe,1000);
}
function isChunkText(s){return /ChunkLoadError|Loading chunk|Loading CSS chunk|importing a module|dynamically imported module|Failed to fetch dynamically/i.test(s||"")}
window.addEventListener("error",function(e){
var t=e&&e.target;
if(t&&(t.tagName==="SCRIPT"||t.tagName==="LINK")){var u=t.src||t.href||"";if(u.indexOf("/_next/static")!==-1){recover();return}}
var m=(e&&(e.message||(e.error&&e.error.message)))||"";
if(isChunkText(m))recover();
},true);
window.addEventListener("unhandledrejection",function(e){
var m=(e&&e.reason&&(e.reason.message||(""+e.reason)))||"";
if(isChunkText(m))recover();
});
})();`;

export default function ChunkErrorGuard() {
  return <script dangerouslySetInnerHTML={{ __html: GUARD_SCRIPT }} />;
}
