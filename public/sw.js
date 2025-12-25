// Service Worker for Goals Tracker PWA
// Handles push notifications, caching, and updates

const CACHE_NAME = "goals-tracker-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/goals",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon.svg",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Service worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some assets failed to cache:", err);
      });
    })
  );
  // Don't skip waiting automatically - wait for message
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Service worker activated");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message handler for skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting requested");
    self.skipWaiting();
  }
});

// Fetch event - network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Skip API routes - always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Skip auth-related routes
  if (url.pathname.startsWith("/auth/") || url.pathname.includes("/login")) {
    return;
  }

  // For navigation requests (HTML pages) - network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the response for offline use
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline page if available
            return caches.match("/dashboard");
          });
        })
    );
    return;
  }

  // For static assets - cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/) ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cached, but update in background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
            .catch(() => {});
          return cached;
        }
        // Not in cache, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }
});

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) {
    console.log("[SW] No data in push event");
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, url, tag, badge } = data;

    const options = {
      body: body || "You have a new notification",
      icon: icon || "/icons/icon-192x192.png",
      badge: badge || "/icons/badge-72x72.png",
      tag: tag || "default",
      data: { url: url || "/" },
      vibrate: [100, 50, 100],
      requireInteraction: true,
      actions: [
        { action: "open", title: "Open" },
        { action: "dismiss", title: "Dismiss" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title || "Goal Tracker", options)
    );
  } catch (error) {
    console.error("[SW] Error parsing push data:", error);

    // Fallback for plain text
    const options = {
      body: event.data.text(),
      icon: "/icons/icon-192x192.png",
    };

    event.waitUntil(
      self.registration.showNotification("Goal Tracker", options)
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        // Open a new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed by user");
});
