import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { BASE_URL } from './scripts/config';
import { syncPendingStories } from './scripts/data/api';

const precacheImages = [{ url: '/images/login-bg.png', revision: 'v1' }];
const manifest = self.__WB_MANIFEST;

precacheAndRoute([...manifest, ...precacheImages]);

registerRoute(
  ({ url }) => {
    return (
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com'
    );
  },
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => {
    return (
      url.origin === 'https://cdnjs.cloudflare.com' ||
      url.origin.includes('fontawesome')
    );
  },
  new CacheFirst({
    cacheName: 'fontawesome',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return (
      baseUrl.origin === url.origin &&
      request.destination !== 'image' &&
      request.method === 'GET'
    );
  },
  new NetworkFirst({
    cacheName: 'story-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return (
      baseUrl.origin === url.origin &&
      request.destination === 'image' &&
      request.method === 'GET'
    );
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stories') {
    event.waitUntil(
      syncPendingStories()
        .then(() => console.log('Background Sync successful!'))
        .catch((err) => console.error('Background Sync failed:', err)),
    );
  }
});

self.addEventListener('push', (event) => {
  async function chainPromise() {
    const data = await event.data.json();
    await self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: '/images/icons/icon-x192.png',
      badge: '/images/icons/icon-white-x72.png',
      actions: [
        { action: 'view', title: '👁️ Read Story' },
        { action: 'close', title: '✖️ Close' },
      ],
    });
  }

  event.waitUntil(chainPromise());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = '/#/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (!client.url.includes(self.location.origin)) continue;

          client.focus();

          try {
            const url = new URL(client.url);
            const currentHash = (url.hash || '').replace('#', '') || '/';
            const isHome = currentHash === '/' || currentHash === '';

            if (!isHome) {
              return client
                .navigate(targetUrl)
                .then(() => {
                  return new Promise((r) => setTimeout(r, 150));
                })
                .then(() => {
                  client.postMessage({
                    type: 'SCROLL_INTENT',
                    intent: 'STORY',
                  });
                });
            } else {
              client.postMessage({ type: 'SCROLL_INTENT', intent: 'STORY' });
            }
          } catch (e) {
            console.error('[SW] URL parse error', e);
            client.postMessage({ type: 'SCROLL_INTENT', intent: 'STORY' });
          }
          return;
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl).then((newClient) => {
            if (newClient) {
              return new Promise((r) => setTimeout(r, 500)).then(() => {
                newClient.postMessage({
                  type: 'SCROLL_INTENT',
                  intent: 'STORY',
                });
              });
            }
          });
        }
      })
      .catch((err) => console.error('[SW] Notification click error:', err)),
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
