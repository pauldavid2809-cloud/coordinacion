/**
 * Utilidad de Notificaciones Push Nativas para el Navegador (Web Push / Service Worker).
 */

export function isPushSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Registra el Service Worker de la aplicación.
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (err) {
    console.warn('Error registrando Service Worker:', err);
    return null;
  }
}

/**
 * Solicita permisos de notificación al usuario.
 */
export async function requestPushPermission() {
  if (!isPushSupported()) return false;

  try {
    if (Notification.permission === 'granted') {
      await registerServiceWorker();
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await registerServiceWorker();
        // Notificación de confirmación inicial
        triggerPushNotification({
          title: 'Seminario Santo Tomás de Aquino',
          body: '🔔 ¡Notificaciones push activadas! Te avisaremos cuando los rectores respondan tus permisos.'
        });
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Error al solicitar permiso de notificación:', err);
    return false;
  }
}

/**
 * Dispara una notificación Push nativa en el dispositivo del usuario.
 */
export async function triggerPushNotification({ title, body, tag, url = '/' }) {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: tag || 'seminario-solicitud',
    renotify: true,
    vibrate: [200, 100, 200],
    data: url
  };

  try {
    // Método 1: A través del Service Worker activo (recomendado para móviles y segundo plano)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    // Método 2: Fallback directo con la API de Notificaciones
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Fallo al disparar notificación push nativa:', err);
    return false;
  }
}
