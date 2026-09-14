// Service Worker para Notificaciones Push del Seminario Mayor Santo Tomás de Aquino

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Manejo de eventos Push entrantes
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Seminario Santo Tomás de Aquino';
  const options = {
    body: data.body || 'Tienes una nueva actualización sobre tu solicitud.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: data.url || '/',
    tag: data.tag || 'seminario-solicitud'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Al hacer clic sobre la notificación, enfocar o abrir la aplicación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rawData = event.notification.data;
  const urlToOpen = (rawData && typeof rawData === 'object' && rawData.url) 
    ? rawData.url 
    : (typeof rawData === 'string' ? rawData : '/');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
