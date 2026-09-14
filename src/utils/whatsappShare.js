import { formatDateTime, formatJurisdiccion } from './formatters.js';

/**
 * Genera el texto formal para compartir el comprobante por WhatsApp.
 */
export function generatePermisoWhatsAppText(permiso, seminarista) {
  const lineas = [
    '🏛️ *SEMINARIO MAYOR SANTO TOMÁS DE AQUINO*',
    '📋 *COMPROBANTE OFICIAL DE PERMISO*',
    '----------------------------------------',
    `👤 *Seminarista:* ${seminarista?.nombreCompleto || seminarista?.nombre || 'No especificado'}`,
    `🪪 *Cédula:* ${seminarista?.cedula || 'N/A'}`,
    `🎓 *Curso:* ${seminarista?.curso || 'N/A'} (${seminarista?.etapa || ''})`,
    `⛪ *Jurisdicción:* ${formatJurisdiccion(seminarista?.diocesis)}`,
    '----------------------------------------',
    `📍 *Destino:* ${permiso.destino || 'No especificado'}`,
    `📝 *Motivo:* ${permiso.motivo || 'No especificado'}`,
    `🏷️ *Tipo:* ${permiso.tipoPermiso || 'Personal'}`,
    `🚪 *Salida:* ${formatDateTime(permiso.fechaSalida)}`,
    `⏰ *Retorno previsto:* ${formatDateTime(permiso.fechaRetorno)}`,
    '----------------------------------------',
    `✅ *ESTADO:* ${permiso.estado ? permiso.estado.toUpperCase() : 'APROBADO'}`,
    permiso.observacionRector ? `💬 *Observación Rectoría:* ${permiso.observacionRector}` : null,
    `📅 *Fecha de Resolución:* ${formatDateTime(permiso.fechaResolucion || new Date())}`,
    `🔑 *Código:* #${permiso.id ? String(permiso.id).slice(-6).toUpperCase() : 'VALIDO'}`,
    '----------------------------------------',
    '_Este documento digital certifica la autorización del equipo formador._'
  ].filter(Boolean);

  return lineas.join('\n');
}

/**
 * Abre WhatsApp web o la app de WhatsApp con el texto codificado.
 */
export function shareViaWhatsApp(text) {
  const encodedText = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(url, '_blank');
}
