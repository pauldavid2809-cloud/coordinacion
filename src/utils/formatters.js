/**
 * Utilidades de formateo para cédulas, fechas y textos.
 */

// Extrae solo los dígitos de una cédula para comparaciones limpias
export function extractCedulaDigits(cedula) {
  if (!cedula) return '';
  return String(cedula).replace(/\D/g, '');
}

// Formatea dígitos a formato venezolano: V-XX.XXX.XXX
export function formatCedulaVenezolana(cedula) {
  const digits = extractCedulaDigits(cedula);
  if (!digits) return '';
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `V-${formatted}`;
}

// Normaliza la búsqueda de cédula
export function matchCedula(cedula1, cedula2) {
  const d1 = extractCedulaDigits(cedula1);
  const d2 = extractCedulaDigits(cedula2);
  return d1.length > 0 && d1 === d2;
}

// Formatea fecha y hora en formato amigable en español
export function formatDateTime(dateInput) {
  if (!dateInput) return 'Fecha no especificada';
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return String(dateInput);
  }
}

// Formatea solo fecha
export function formatDate(dateInput) {
  if (!dateInput) return 'Fecha no especificada';
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('es-VE', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (err) {
    return String(dateInput);
  }
}

// Tiempo relativo ("hace X minutos")
export function timeAgo(dateInput) {
  if (!dateInput) return '';
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    const now = new Date();
    const diffSecs = Math.floor((now - d) / 1000);

    if (diffSecs < 60) return 'hace un momento';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
  } catch (err) {
    return '';
  }
}
