/**
 * UstaGo Avto — Progressive Web App (PWA) Service Worker
 * Version: 1.0.0
 */

const CACHE_NAME = "ustago-pwa-v1";
const OFFLINE_FALLBACK_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/logo.svg",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-192x192-maskable.png",
  "/icons/icon-512x512.png",
  "/icons/icon-512x512-maskable.png",
  "/icons/apple-touch-icon.png",
];

// Install: pre-cache critical offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch handling: Stale-While-Revalidate for static, Network-First with Offline fallback for navigation
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignore non-GET or cross-origin external API / non-http requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Do not cache API endpoints
  if (request.url.includes("/api/")) {
    return;
  }

  // Navigation requests (HTML pages) -> Network-First, fallback to Offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const fallback = await caches.match(OFFLINE_FALLBACK_URL);
          return (
            fallback ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }),
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts) -> Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }),
  );
});
