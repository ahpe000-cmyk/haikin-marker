// 最小限のService Worker（PWAインストール要件のため）。
// オフライン対応はP3。ここではネットワークをそのまま通す。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
