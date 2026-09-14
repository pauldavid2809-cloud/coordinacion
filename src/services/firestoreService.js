import { 
  firestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from '../utils/firebase';
import initialSeminaristas from '../data/seminaristas.json';

const LOCAL_SOLICITUDES_KEY = 'seminario_solicitudes_cache';
const LOCAL_SEMINARISTAS_KEY = 'seminario_seminaristas_cache';

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
    console.error('Error guardando en caché local', e);
  }
}

/**
 * Inicializa y escucha la lista de seminaristas en tiempo real.
 * Si Firestore no tiene datos o está vacío, precarga los 38 seminaristas iniciales.
 */
export function subscribeToSeminaristas(callback) {
  let cached = getLocalCache(LOCAL_SEMINARISTAS_KEY, initialSeminaristas);
  callback(cached);

  try {
    const semCol = collection(firestore, 'seminaristas');
    const unsubscribe = onSnapshot(semCol, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setLocalCache(LOCAL_SEMINARISTAS_KEY, list);
        callback(list);
      } else {
        // Precargar seminaristas iniciales a Firestore
        seedInitialSeminaristas();
      }
    }, (error) => {
      console.warn('Firestore offline o reglas restringidas. Usando padrón local:', error.message);
      callback(cached);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Fallo al suscribirse a seminaristas en Firestore:', err);
    callback(cached);
    return () => {};
  }
}

/**
 * Precargar los 38 seminaristas a Firestore si aún no existen.
 */
export async function seedInitialSeminaristas() {
  try {
    for (const sem of initialSeminaristas) {
      const docRef = doc(firestore, 'seminaristas', sem.id);
      await setDoc(docRef, sem, { merge: true });
    }
  } catch (err) {
    console.warn('No se pudo precargar a Firestore directamente, usando almacenamiento local:', err.message);
  }
}

/**
 * Escucha todas las solicitudes en tiempo real (Permisos, Necesidades, Propuestas).
 */
export function subscribeToSolicitudes(callback) {
  let cached = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  callback(cached);

  try {
    const solCol = collection(firestore, 'solicitudes');
    const q = query(solCol, orderBy('fechaCreacion', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          fechaCreacion: data.fechaCreacion?.toDate ? data.fechaCreacion.toDate().toISOString() : data.fechaCreacion
        };
      });
      setLocalCache(LOCAL_SOLICITUDES_KEY, items);
      callback(items);
    }, (error) => {
      console.warn('Firestore suscripción en modo local por reglas/red:', error.message);
      // Mantener con caché local
      callback(getLocalCache(LOCAL_SOLICITUDES_KEY, []));
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Error iniciando suscripción de solicitudes:', err);
    callback(cached);
    return () => {};
  }
}

/**
 * Crear una nueva solicitud (Permiso, Necesidad o Propuesta).
 */
export async function crearSolicitud(solicitudData) {
  const nueva = {
    ...solicitudData,
    fechaCreacion: new Date().toISOString(),
    estado: 'pendiente', // 'pendiente' | 'aprobado' | 'rechazado' | 'en_revision' | 'resuelta'
    observacionRector: '',
    fechaResolucion: null,
  };

  // Guardar en caché local primero para respuesta inmediata
  const localItems = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  const tempId = 'sol-' + Date.now();
  nueva.id = tempId;
  const updatedLocal = [nueva, ...localItems];
  setLocalCache(LOCAL_SOLICITUDES_KEY, updatedLocal);

  try {
    const docRef = await addDoc(collection(firestore, 'solicitudes'), nueva);
    nueva.id = docRef.id;
    // Actualizar con el ID real de Firestore
    const synced = updatedLocal.map(item => item.id === tempId ? { ...item, id: docRef.id } : item);
    setLocalCache(LOCAL_SOLICITUDES_KEY, synced);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn('Guardado en modo local (Firestore pendiente de sincronizar):', error.message);
    return { success: true, id: tempId, localOnly: true };
  }
}

/**
 * Actualizar el estado de una solicitud (Aprobado, Rechazado, En Revisión, Resuelta) con notas.
 */
export async function actualizarEstadoSolicitud(solicitudId, nuevoEstado, observacion = '') {
  const resolucion = {
    estado: nuevoEstado,
    observacionRector: observacion,
    fechaResolucion: new Date().toISOString()
  };

  // Actualizar en caché local
  const localItems = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  const updatedLocal = localItems.map(item => {
    if (item.id === solicitudId) {
      return { ...item, ...resolucion };
    }
    return item;
  });
  setLocalCache(LOCAL_SOLICITUDES_KEY, updatedLocal);

  try {
    const docRef = doc(firestore, 'solicitudes', solicitudId);
    await updateDoc(docRef, resolucion);
    return { success: true };
  } catch (error) {
    console.warn('Actualizado en caché local (Firestore pendiente):', error.message);
    return { success: true, localOnly: true };
  }
}

/**
 * Guardar o actualizar datos de un seminarista en el padrón.
 */
export async function guardarSeminarista(seminarista) {
  const semId = seminarista.id || ('sem-' + Date.now());
  const payload = { ...seminarista, id: semId };

  // Actualizar en caché local
  const localList = getLocalCache(LOCAL_SEMINARISTAS_KEY, initialSeminaristas);
  const index = localList.findIndex(s => s.id === semId || s.cedula === seminarista.cedula);
  let updatedList = [];
  if (index >= 0) {
    updatedList = [...localList];
    updatedList[index] = payload;
  } else {
    updatedList = [...localList, payload];
  }
  setLocalCache(LOCAL_SEMINARISTAS_KEY, updatedList);

  try {
    const docRef = doc(firestore, 'seminaristas', semId);
    await setDoc(docRef, payload, { merge: true });
    return { success: true, id: semId };
  } catch (error) {
    console.warn('Seminarista guardado en caché local:', error.message);
    return { success: true, id: semId, localOnly: true };
  }
}

/**
 * Eliminar una solicitud.
 */
export async function eliminarSolicitud(solicitudId) {
  const localItems = getLocalCache(LOCAL_SOLICITUDES_KEY, []);
  const updatedLocal = localItems.filter(item => item.id !== solicitudId);
  setLocalCache(LOCAL_SOLICITUDES_KEY, updatedLocal);

  try {
    const docRef = doc(firestore, 'solicitudes', solicitudId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: true, localOnly: true };
  }
}
