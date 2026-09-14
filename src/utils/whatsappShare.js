import { formatDateTime, formatJurisdiccion } from './formatters.js';

/**
 * Genera el texto formal para compartir el comprobante por WhatsApp.
 * Soporta un saludo específico si se envía directamente a un Formador.
 */
export function generatePermisoWhatsAppText(permiso, seminarista, destinatario = null) {
  const encabezado = destinatario
    ? `Estimado ${destinatario}, le comparto mi Pase Digital de Salida autorizado por Rectoría:\n\n`
    : '';

  const lineas = [
    encabezado + '🏛️ *SEMINARIO MAYOR SANTO TOMÁS DE AQUINO*',
    '📋 *PASE DIGITAL OFICIAL DE SALIDA*',
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
    permiso.observacionRector ? `💬 *Observación / Condición:* ${permiso.observacionRector}` : null,
    `📅 *Fecha de Resolución:* ${formatDateTime(permiso.fechaResolucion || new Date())}`,
    `🔑 *Código:* #${permiso.id ? String(permiso.id).slice(-8).toUpperCase() : 'VALIDO'}`,
    '----------------------------------------',
    '_Documento digital institucional verificado por el Sistema de Rectoría 2026-2027._'
  ].filter(Boolean);

  return lineas.join('\n');
}

/**
 * Abre WhatsApp web o la app de WhatsApp con el texto codificado.
 * Si se indica un número de teléfono, se abre directamente el chat con esa persona.
 * Convierte formatos venezolanos (0414..., 0424..., 0412...) a formato internacional (+58...).
 */
export function shareViaWhatsApp(text, phone = null) {
  const encodedText = encodeURIComponent(text);
  let cleanPhone = '';
  if (phone) {
    cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '58' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('58') && cleanPhone.length === 10) {
      cleanPhone = '58' + cleanPhone;
    }
  }

  // Solo se adjunta el parámetro de teléfono si tiene longitud válida (mínimo 11 dígitos con código 58)
  const hasValidPhone = cleanPhone && cleanPhone.length >= 11;

  const url = hasValidPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  window.open(url, '_blank');
}

