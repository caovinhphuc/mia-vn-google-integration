/**
 * MIA Warehouse Service Worker
 * - Caching strategy cho offline support
 * - Background sync cho data
 * - Push notifications support
 */

const CACHE_NAME = 'mia-warehouse-v1.0.0';
const STATIC_CACHE = 'mia-static-v1.0.0';
const DYNAMIC_CACHE = 'mia-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/google\/sheets/,
  /\/api\/google\/drive/,
  /\/api\/settings/
];

// ==================== INSTALL EVENT ====================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ==================== ACTIVATE EVENT ====================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// ==================== FETCH EVENT ====================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same-origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else if (url.origin === 'https://sheets.googleapis.com' ||
    url.origin === 'https://www.googleapis.com' ||
    url.origin === 'https://drive.googleapis.com') {
    // Google API requests
    event.respondWith(handleGoogleAPIRequest(request));
  } else {
    // Other external requests
    event.respondWith(handleExternalRequest(request));
  }
});

// ==================== REQUEST HANDLERS ====================

async function handleSameOriginRequest(request) {
  const url = new URL(request.url);

  // Static assets - cache first strategy
  if (url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')) {

    return cacheFirst(request, STATIC_CACHE);
  }

  // API requests - network first with fallback
  if (url.pathname.startsWith('/api/')) {
    return networkFirst(request, DYNAMIC_CACHE);
  }

  // HTML pages - network first with offline fallback
  if (request.headers.get('accept').includes('text/html')) {
    return networkFirst(request, DYNAMIC_CACHE, '/');
  }

  // Default: network first
  return networkFirst(request, DYNAMIC_CACHE);
}

async function handleGoogleAPIRequest(request) {
  // Google API requests - network first with longer cache
  return networkFirst(request, DYNAMIC_CACHE, null, 60 * 60 * 1000); // 1 hour cache
}

async function handleExternalRequest(request) {
  // External requests - network only
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] External request failed:', request.url);
    throw error;
  }
}

// ==================== CACHING STRATEGIES ====================

async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed for:', request.url);
    throw error;
  }
}

async function networkFirst(request, cacheName, fallbackUrl = null, cacheTime = 5 * 60 * 1000) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return fallback if available
    if (fallbackUrl) {
      const fallbackResponse = await cache.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    throw error;
  }
}

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'google-sheets-sync') {
    event.waitUntil(syncGoogleSheetsData());
  } else if (event.tag === 'audit-log-sync') {
    event.waitUntil(syncAuditLogs());
  }
});

async function syncGoogleSheetsData() {
  try {
    console.log('[SW] Syncing Google Sheets data...');
    // Implementation for syncing pending Google Sheets operations
    const pendingOperations = await getPendingOperations();

    for (const operation of pendingOperations) {
      try {
        await processOperation(operation);
        await markOperationCompleted(operation.id);
      } catch (error) {
        console.error('[SW] Failed to sync operation:', operation.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncAuditLogs() {
  try {
    console.log('[SW] Syncing audit logs...');
    // Implementation for syncing pending audit logs
    const pendingLogs = await getPendingAuditLogs();

    for (const log of pendingLogs) {
      try {
        await sendAuditLog(log);
        await markLogSynced(log.id);
      } catch (error) {
        console.error('[SW] Failed to sync audit log:', log.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Audit log sync failed:', error);
  }
}

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'MIA Warehouse notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Xem chi tiết',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Đóng',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MIA Warehouse', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// ==================== MESSAGE HANDLING ====================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.urls)
    );
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
}

// ==================== UTILITY FUNCTIONS ====================

async function getPendingOperations() {
  // Implementation to get pending operations from IndexedDB
  return [];
}

async function processOperation(operation) {
  // Implementation to process operation
  console.log('[SW] Processing operation:', operation);
}

async function markOperationCompleted(id) {
  // Implementation to mark operation as completed
  console.log('[SW] Marking operation completed:', id);
}

async function getPendingAuditLogs() {
  // Implementation to get pending audit logs from IndexedDB
  return [];
}

async function sendAuditLog(log) {
  // Implementation to send audit log to server
  console.log('[SW] Sending audit log:', log);
}

async function markLogSynced(id) {
  // Implementation to mark log as synced
  console.log('[SW] Marking log synced:', id);
}

// ==================== ERROR HANDLING ====================

self.addEventListener('error', (event) => {
  console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] MIA Warehouse Service Worker loaded successfully');
