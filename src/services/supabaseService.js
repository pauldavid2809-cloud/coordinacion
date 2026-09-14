import { supabase } from '../utils/supabase.js';
import initialSeminaristas from '../data/seminaristas.json' with { type: 'json' };

const LOCAL_SOLICITUDES_KEY = 'seminario_solicitudes_supabase_cache';
const LOCAL_SEMINARISTAS_KEY = 'seminario_seminaristas_supabase_cache';

// Helper para leer caché local
function getLocalCache(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Helper para guardar en caché local
function setLocalCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error en caché local:', e);
  }
}

// Mapeos DB (snake_case) <-> Frontend (camelCase)
export function mapSeminaristaFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    nombreCompleto: row.nombre_completo,
    cedula: row.cedula,
    telefono: row.telefono,
    curso: row.curso,
    etapa: row.etapa,
    diocesis: row.diocesis,
    foto: row.foto
  };
}

export function mapSeminaristaToDb(sem) {
  return {
    id: sem.id,
    nombre: sem.nombre,
    nombre_completo: sem.nombreCompleto || sem.nombre,
    cedula: sem.cedula,
    telefono: sem.telefono || null,
    curso: sem.curso || null,
    etapa: sem.etapa || null,
    diocesis: sem.diocesis || null,
    foto: sem.foto || null
  };
}

export function mapSolicitudFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    tipo: row.tipo,
    seminaristaId: row.seminarista_id,
    seminaristaNombre: row.seminarista_nombre,
    seminaristaCedula: row.seminarista_cedula,
    seminaristaCurso: row.seminarista_curso,
    seminaristaDiocesis: row.seminarista_diocesis,
    tipoPermiso: row.tipo_permiso,
    motivo: row.motivo,
    destino: row.destino,
    fechaSalida: row.fecha_salida,
    fechaRetorno: row.fecha_retorno,
    area: row.area,
    urgencia: row.urgencia,
    descripcion: row.descripcion,
    titulo: row.titulo,
    dimension: row.dimension,
    justificacion: row.justificacion,
    detalles: row.detalles,
    estado: row.estado || 'pendiente',
    observacionRector: row.observacion_rector || '',
    fechaResolucion: row.fecha_resolucion,
    fechaCreacion: row.fecha_creacion
  };
}

export function mapSolicitudToDb(sol) {
  return {
    id: sol.id,
    tipo: sol.tipo,
    seminarista_id: sol.seminaristaId,
    seminarista_nombre: sol.seminaristaNombre,
    seminarista_cedula: sol.seminaristaCedula,
    seminarista_curso: sol.seminaristaCurso,
    seminarista_diocesis: sol.seminaristaDiocesis,
    tipo_permiso: sol.tipoPermiso || null,
    motivo: sol.motivo || null,
    destino: sol.destino || null,
    fecha_salida: sol.fechaSalida || null,
    fecha_retorno: sol.fechaRetorno || null,
    area: sol.area || null,
    urgencia: sol.urgencia || null,
    descripcion: sol.descripcion || null,
    titulo: sol.titulo || null,
    dimension: sol.dimension || null,
    justificacion: sol.justificacion || null,
    detalles: sol.detalles || null,
    estado: sol.estado || 'pendiente',
    observacion_rector: sol.observacionRector || '',
    fecha_resolucion: sol.fechaResolucion || null,
    fecha_creacion: sol.fechaCreacion || new Date().toISOString()
  };
}

/**
 * Escucha y obtiene la lista de seminaristas desde Supabase con tiempo real.
 */
export function subscribeToSeminaristas(callback) {
  const cached = getLocalCache(LOCAL_SEMINARISTAS_KEY, initialSeminaristas);
  callback(cached);

  const fetchSeminaristas = async () => {
    try {
      const { data, error } = await supabase
        .from('seminaristas')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapSeminaristaFromDb);
        setLocalCache(LOCAL_SEMINARISTAS_KEY, mapped);
        callback(mapped);
      }
    } catch (err) {
      console.warn('Usando padrón local o caché:', err.message);
      callback(cached);
    }
  };

  fetchSeminaristas();

  // Suscripción Realtime en Supabase
  const channel = supabase
    .channel('realtime-seminaristas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'seminaristas' }, () => {
      fetchSeminaristas();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Escucha y obtiene las solicitudes en tiempo real desde Supabase.
 */
export function subscribeToSolicitudes(callback) {
  const cached = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  callback(cached);

  const fetchSolicitudes = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = data.map(mapSolicitudFromDb);
        setLocalCache(LOCAL_SOLICITUDES_KEY, mapped);
        callback(mapped);
      }
    } catch (err) {
      console.warn('Usando solicitudes en caché local:', err.message);
      callback(getLocalCache(LOCAL_SOLICITUDES_KEY, []));
    }
  };

  fetchSolicitudes();

  // Suscripción Realtime en Supabase
  const channel = supabase
    .channel('realtime-solicitudes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
      fetchSolicitudes();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Crear una nueva solicitud en Supabase.
 */
export async function crearSolicitud(solicitudData) {
  const tempId = 'sol-' + Date.now();
  const nueva = {
    ...solicitudData,
    id: tempId,
    fechaCreacion: new Date().toISOString(),
    estado: 'pendiente',
    observacionRector: '',
    fechaResolucion: null
  };

  // Optimistic update en caché local
  const current = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  setLocalCache(LOCAL_SOLICITUDES_KEY, [nueva, ...current]);

  try {
    const dbPayload = mapSolicitudToDb(nueva);
    const { data, error } = await supabase
      .from('solicitudes')
      .insert([dbPayload])
      .select();

    if (error) throw error;

    return { success: true, id: data?.[0]?.id || tempId };
  } catch (err) {
    console.warn('Guardado en caché local (Supabase pendiente):', err.message);
    return { success: true, id: tempId, localOnly: true };
  }
}

/**
 * Actualizar el estado de una solicitud en Supabase.
 */
export async function actualizarEstadoSolicitud(solicitudId, nuevoEstado, observacion = '') {
  const updateData = {
    estado: nuevoEstado,
    observacion_rector: observacion,
    fecha_resolucion: new Date().toISOString()
  };

  // Optimistic update
  const current = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  const updated = current.map(item => item.id === solicitudId ? {
    ...item,
    estado: nuevoEstado,
    observacionRector: observacion,
    fechaResolucion: updateData.fecha_resolucion
  } : item);
  setLocalCache(LOCAL_SOLICITUDES_KEY, updated);

  try {
    const { error } = await supabase
      .from('solicitudes')
      .update(updateData)
      .eq('id', solicitudId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.warn('Actualizado localmente (Supabase pendiente):', err.message);
    return { success: true, localOnly: true };
  }
}

/**
 * Guardar o actualizar datos de un seminarista en Supabase.
 */
export async function guardarSeminarista(seminarista) {
  const semId = seminarista.id || ('sem-' + Date.now());
  const payload = { ...seminarista, id: semId };

  // Optimistic update
  const current = getLocalCache(LOCAL_SEMINARISTAS_KEY, initialSeminaristas);
  const idx = current.findIndex(s => s.id === semId || s.cedula === seminarista.cedula);
  let updatedList = [];
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = payload;
  } else {
    updatedList = [...current, payload];
  }
  setLocalCache(LOCAL_SEMINARISTAS_KEY, updatedList);

  try {
    const dbPayload = mapSeminaristaToDb(payload);
    const { error } = await supabase
      .from('seminaristas')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, id: semId };
  } catch (err) {
    console.warn('Guardado en caché local (Supabase pendiente):', err.message);
    return { success: true, id: semId, localOnly: true };
  }
}

/**
 * Eliminar una solicitud de Supabase.
 */
export async function eliminarSolicitud(solicitudId) {
  const current = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  setLocalCache(LOCAL_SOLICITUDES_KEY, current.filter(s => s.id !== solicitudId));

  try {
    const { error } = await supabase
      .from('solicitudes')
      .delete()
      .eq('id', solicitudId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: true, localOnly: true };
  }
}
