/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision?: string }> };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// Navegaciones: siempre se intenta la red primero (nunca HTML cacheado primero).
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/~oauth/],
  }),
);

// Recursos propios con hash: cache primero.
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    /\/assets\//.test(url.pathname) &&
    ['script', 'style', 'font', 'image'].includes(request.destination),
  new CacheFirst({ cacheName: 'matriz-assets' }),
);

registerRoute(
  ({ url }) => url.origin === self.location.origin && /\.(?:png|ico|svg|webmanifest)$/.test(url.pathname),
  new NetworkFirst({ cacheName: 'matriz-static' }),
);

// ---- Avisos de la agenda ----
self.addEventListener('push', event => {
  let datos: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data?.text() };
  }

  event.waitUntil(
    self.registration.showNotification(datos.title || '⏰ Recordatorio de tu agenda', {
      body: datos.body || '¡Es casi la hora de tu práctica!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: datos.tag || 'matriz-recordatorio',
      data: { url: datos.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destino = (event.notification.data as { url?: string } | undefined)?.url || '/';
  event.waitUntil(
    (async () => {
      const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const abierto = clientes.find(c => 'focus' in c);
      if (abierto) {
        await (abierto as WindowClient).focus();
        return;
      }
      await self.clients.openWindow(destino);
    })(),
  );
});
