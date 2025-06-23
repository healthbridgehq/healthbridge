const CACHE_NAME = 'healthbridge-cache-v1';
const API_CACHE_NAME = 'healthbridge-api-cache-v1';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event - handle offline access
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache));
          }
          return response;
        });
      })
  );
});

// Handle API requests
async function handleApiRequest(request) {
  // Try network first
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, responseToCache);
      return response;
    }
  } catch (error) {
    console.log('Network request failed, trying cache:', error);
  }

  // If network fails, try cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // If both network and cache fail, return offline response
  return new Response(
    JSON.stringify({
      error: 'You are offline and no cached data is available.'
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'healthbridge-sync') {
    event.waitUntil(syncData());
  }
});

// Periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'healthbridge-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Get all pending actions from IndexedDB
    const db = await openDB('healthbridge_offline', 1);
    const tx = db.transaction('pendingActions', 'readonly');
    const pendingActions = await tx.store.getAll();

    // Process each pending action
    for (const action of pendingActions) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(action)
        });

        if (response.ok) {
          // Remove successful action
          const deleteTx = db.transaction('pendingActions', 'readwrite');
          await deleteTx.store.delete(action.id);
        }
      } catch (error) {
        console.error('Error syncing action:', error);
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: data.data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
  );
});
