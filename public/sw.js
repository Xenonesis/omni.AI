/**
 * Service Worker for omniverse.AI Voice Shopping Marketplace
 * Provides offline functionality, caching, and performance optimizations
 */

const CACHE_NAME = 'omniverse-ai-v1.0.0';
const STATIC_CACHE = 'omniverse-static-v1.0.0';
const DYNAMIC_CACHE = 'omniverse-dynamic-v1.0.0';
const API_CACHE = 'omniverse-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/omniverse-favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  // Add critical CSS and JS files here when they're generated
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/search',
  '/api/products',
  '/api/health'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  DYNAMIC: 24 * 60 * 60 * 1000,     // 1 day
  API: 5 * 60 * 1000,               // 5 minutes
  IMAGES: 7 * 24 * 60 * 60 * 1000   // 7 days
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine cache strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Handle static assets (cache first)
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
      const now = new Date();
      
      if (now - cacheDate < CACHE_DURATIONS.STATIC) {
        return cachedResponse;
      }
    }
    
    // Fetch from network and update cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Static asset fetch failed:', error);
    // Return cached version if available
    const cache = await caches.open(STATIC_CACHE);
    return cache.match(request) || new Response('Asset not available offline');
  }
}

// Handle API requests (network first with cache fallback)
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE);
    
    // Try network first
    try {
      const networkResponse = await fetch(request, {
        timeout: 5000 // 5 second timeout
      });
      
      if (networkResponse.ok) {
        // Cache successful responses
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
        return networkResponse;
      }
    } catch (networkError) {
      console.warn('🌐 Network request failed, trying cache:', networkError);
    }
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Add header to indicate cached response
      const response = cachedResponse.clone();
      response.headers.set('X-Cache-Status', 'HIT');
      return response;
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'API unavailable offline',
      cached: false,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ API request failed:', error);
    return new Response(JSON.stringify({
      error: 'Request failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle image requests (cache first with network fallback)
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is still valid
      const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
      const now = new Date();
      
      if (now - cacheDate < CACHE_DURATIONS.IMAGES) {
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Image fetch failed:', error);
    // Return cached version or placeholder
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return placeholder image
    return new Response(
      '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle dynamic requests (stale while revalidate)
async function handleDynamicRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Start network request (don't await)
    const networkPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    
    // Return cached response immediately if available
    if (cachedResponse) {
      // Update cache in background
      networkPromise.catch(() => {});
      return cachedResponse;
    }
    
    // Wait for network if no cache
    return await networkPromise || new Response('Content not available offline');
  } catch (error) {
    console.error('❌ Dynamic request failed:', error);
    return new Response('Request failed');
  }
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
         url.pathname === '/' ||
         url.pathname.endsWith('.html') ||
         url.pathname.includes('/assets/');
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.hostname.includes('omnidim.io') ||
         url.hostname.includes('omniverse.ai');
}

function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 Performing background sync...');
  // Implement background sync logic here
  // For example, sync offline voice searches, saved products, etc.
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/omniverse-favicon.svg',
      badge: '/omniverse-favicon.svg',
      data: data.data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('🚀 omniverse.AI Service Worker loaded successfully');
