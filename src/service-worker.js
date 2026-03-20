/* eslint-disable no-restricted-globals */
/**
 * Service Worker for React OAS Integration v4.0
 * Provides offline support and caching strategies
 */

// This is required by Workbox InjectManifest plugin
// eslint-disable-next-line no-undef
const precacheManifest = self.__WB_MANIFEST || [];

// Bump khi sửa logic SW — xóa cache cũ có thể map nhầm JS → index.html
const CACHE_NAME = "react-oas-v4.0.2";
const DATA_CACHE_NAME = "react-oas-data-v4.0.2";

// Chỉ thêm asset tồn tại; CRA dùng main.[hash].js — không dùng /static/js/bundle.js
const FILES_TO_CACHE = ["/manifest.json", "/favicon.ico"];

// API endpoints to cache with network-first strategy
const API_URLS = ["/api/", "https://sheets.googleapis.com/", "https://www.googleapis.com/"];

/**
 * Install Event - Cache static assets
 */
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline page");

      // Precache files from Workbox manifest
      const urlsToPrecache = precacheManifest.map((entry) =>
        typeof entry === "string" ? entry : entry.url
      );

      // Add additional files to cache
      const allFilesToCache = [...urlsToPrecache, ...FILES_TO_CACHE];

      return cache.addAll(allFilesToCache).catch((err) => {
        console.warn("[ServiceWorker] Cache addAll failed:", err);
        // Continue even if some files fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch Event - Implement caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin && !isAPIRequest(request)) {
    return;
  }

  // API Requests - Network First with Cache Fallback
  if (isAPIRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // JS/CSS chunks: network-first + không cache / không dùng bản cache nếu là HTML (tránh Unexpected token '<')
  if (url.origin === self.location.origin && isWebpackStaticAsset(url)) {
    event.respondWith(networkFirstStaticAsset(request));
    return;
  }

  // Còn lại — cache-first
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Check if request is an API call
 */
function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_URLS.some((apiUrl) => url.href.includes(apiUrl));
}

/** Chunk JS/CSS CRA — cache-first dễ giữ nhầm HTML sau deploy; ưu tiên network + kiểm tra MIME */
function isWebpackStaticAsset(url) {
  const p = url.pathname;
  return (
    p.includes("/static/js/") || p.includes("/static/css/") || /\.(js|mjs|css)(\?.*)?$/i.test(p)
  );
}

function responseLooksLikeJavaScript(response) {
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  if (!ct) return true;
  if (ct.includes("text/html")) return false;
  return ct.includes("javascript") || ct.includes("ecmascript");
}

function responseLooksLikeCss(response) {
  const ct = (response.headers.get("content-type") || "").toLowerCase();
  if (!ct) return true;
  if (ct.includes("text/html")) return false;
  return ct.includes("css");
}

function staticAssetMimeOk(request, response) {
  const url = new URL(request.url);
  const p = url.pathname.toLowerCase();
  if (p.endsWith(".css") || p.includes("/static/css/")) {
    return responseLooksLikeCss(response);
  }
  if (p.endsWith(".js") || p.endsWith(".mjs") || p.includes("/static/js/")) {
    return responseLooksLikeJavaScript(response);
  }
  return true;
}

/**
 * Network First Strategy - For API calls
 * Try network first, fall back to cache if network fails
 */
/**
 * Network-first cho /static/js|css — tránh phục vụ index.html từ cache như bundle.js
 */
async function networkFirstStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      if (staticAssetMimeOk(request, networkResponse)) {
        await cache.put(request.url, networkResponse.clone());
        return networkResponse;
      }
      await cache.delete(request.url);
      const cached = await caches.match(request);
      if (cached && staticAssetMimeOk(request, cached)) return cached;
      return networkResponse;
    }
    const cached = await caches.match(request);
    if (cached && staticAssetMimeOk(request, cached)) return cached;
    return networkResponse;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached && staticAssetMimeOk(request, cached)) return cached;
    throw e;
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const dataCache = await caches.open(DATA_CACHE_NAME);
      dataCache.put(request.url, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Network request failed, using cache:", error);

    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response if no cache available
    return new Response(
      JSON.stringify({
        error: "Network error",
        offline: true,
        message: "You are offline. Please check your connection.",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      }
    );
  }
}

/**
 * Cache First Strategy - For static assets
 * Serve from cache if available, otherwise fetch from network
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse && staticAssetMimeOk(request, cachedResponse)) {
      return cachedResponse;
    }
    if (cachedResponse && !staticAssetMimeOk(request, cachedResponse)) {
      const c = await caches.open(CACHE_NAME);
      await c.delete(request.url);
    }

    const networkResponse = await fetch(request);

    if (
      networkResponse &&
      networkResponse.status === 200 &&
      staticAssetMimeOk(request, networkResponse)
    ) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request.url, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Fetch failed:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Không trả index.html cho script/style — sẽ gây SyntaxError: Unexpected token '<'
    const dest = request.destination;
    const isNavigation = request.mode === "navigate" || dest === "document";
    if (isNavigation) {
      const page = await caches.match("/index.html");
      if (page) return page;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Message Event - Handle messages from clients
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          return caches.delete(key);
        })
      );
    });
  }
});
