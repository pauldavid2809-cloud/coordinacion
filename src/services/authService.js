import { extractCedulaDigits, matchCedula } from '../utils/formatters.js';
import initialSeminaristas from '../data/seminaristas.json' with { type: 'json' };

const RECTOR_MASTER_KEY = 'Coromoto11';
const SESSION_STORAGE_KEY = 'seminario_session';

/**
 * Autenticación de seminaristas mediante cédula.
 */
export function authenticateSeminarista(cedulaInput, listaSeminaristas = null) {
  const digits = extractCedulaDigits(cedulaInput);
  if (!digits || digits.length < 6) {
    return {
      success: false,
      error: 'Por favor ingresa un número de cédula válido (mínimo 6 dígitos).'
    };
  }

  const padron = (listaSeminaristas && listaSeminaristas.length > 0) 
    ? listaSeminaristas 
    : initialSeminaristas;

  const found = padron.find(s => matchCedula(s.cedula, digits));

  if (!found) {
    return {
      success: false,
      error: 'La cédula ingresada no se encuentra registrada en el padrón de seminaristas 2026-2027.'
    };
  }

  const session = {
    role: 'seminarista',
    user: found,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  return {
    success: true,
    user: found
  };
}

/**
 * Autenticación de Rectores con clave maestra.
 */
export function authenticateRector(claveInput) {
  if (!claveInput) {
    return {
      success: false,
      error: 'Por favor ingresa la clave de acceso de Rectoría.'
    };
  }

  if (claveInput.trim() !== RECTOR_MASTER_KEY) {
    return {
      success: false,
      error: 'Clave de Rectoría incorrecta. Verifica e intenta nuevamente.'
    };
  }

  const session = {
    role: 'rector',
    user: {
      nombre: 'Rectoría / Equipo Formador',
      cargo: 'Formador'
    },
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

  return {
    success: true,
    user: session.user
  };
}

/**
 * Obtener la sesión actual si existe.
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Cerrar sesión activa.
 */
export function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
