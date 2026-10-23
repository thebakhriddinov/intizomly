/**
 * Intizomly — Service Worker for Mobile Notifications & Background Alerts
 */

const CACHE_NAME = 'intizomly-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Intizomly Eslatmasi', message: 'Bugungi odatlaringizni tekshiring! 🚫🍬' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: 'assets/icon-192.png',
    badge: 'assets/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'intizomly-daily-reminder',
    renotify: true,
    data: {
      url: './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click notification event to open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
