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
 * Reproduce un acorde armónico sutil mediante Web Audio API sin necesidad de archivos externos.
 */
export function playNotificationChime(type = 'success') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'success') {
      // Acorde armónico ascendente: Sol4 -> Do5 -> Mi5 (Aprobación)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.00, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.22);
    } else {
      // Tono reflexivo suave (Rechazo / Aviso)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(349.23, now + 0.18);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    // Si el navegador bloquea AudioContext sin interacción previa, se ignora limpiamente
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
        playNotificationChime('success');
        // Notificación de confirmación inicial
        triggerPushNotification({
          title: 'Seminario Santo Tomás de Aquino',
          body: 'Notificaciones activadas. Te avisaremos cuando los formadores respondan tus solicitudes.'
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
 * Dispara una notificación Push nativa en el dispositivo del usuario y reproduce sonido.
 */
export async function triggerPushNotification({ title, body, tag, url = '/' }) {
  playNotificationChime(title && title.toLowerCase().includes('aprobado') ? 'success' : 'alert');

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

  // Método 1: A través del Service Worker con límite de espera de 1.5s
  if ('serviceWorker' in navigator) {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
      ]);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return true;
      }
    } catch (e) {
      // Continuar al método directo
    }
  }

  // Método 2: Fallback directo con la API de Notificaciones
  try {
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
