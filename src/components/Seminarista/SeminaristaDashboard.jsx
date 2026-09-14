import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Wrench, 
  Lightbulb, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Plus, 
  Bell,
  BellRing,
  Volume2,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado.jsx';
import SolicitudPermisoModal from './SolicitudPermisoModal.jsx';
import SolicitudNecesidadModal from './SolicitudNecesidadModal.jsx';
import SolicitudPropuestaModal from './SolicitudPropuestaModal.jsx';
import PaseDigitalModal from './PaseDigitalModal.jsx';
import { formatDateTime, timeAgo, formatJurisdiccion } from '../../utils/formatters.js';
import { eliminarSolicitud } from '../../services/supabaseService.js';
import { 
  isPushSupported, 
  getNotificationPermission, 
  requestPushPermission, 
  registerServiceWorker, 
  triggerPushNotification,
  playNotificationChime
} from '../../utils/pushNotifications.js';

export default function SeminaristaDashboard({ seminarista, solicitudes = [], onNotify }) {
  const [modalType, setModalType] = useState(null); // 'permiso' | 'necesidad' | 'propuesta'
  const [selectedPase, setSelectedPase] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'permiso' | 'necesidad' | 'propuesta'
  const [pushPermission, setPushPermission] = useState('default');
  const [alertaResolucion, setAlertaResolucion] = useState(null);

  const NOTIF_SEEN_KEY = seminarista?.id 
    ? `seminario_notif_seen_${seminarista.id}` 
    : 'seminario_notif_seen_default';

  const alertedIdsRef = useRef(new Set());

  // Registrar Service Worker y verificar permiso de notificaciones push
  useEffect(() => {
    registerServiceWorker();
    setPushPermission(getNotificationPermission());
  }, []);

  const handleActivarPush = async () => {
    const granted = await requestPushPermission();
    setPushPermission(getNotificationPermission());
    if (granted && onNotify) {
      onNotify('Notificaciones push activadas en este dispositivo.');
    }
  };

  const handleProbarNotificacion = async () => {
    playNotificationChime('success');
    
    if (pushPermission !== 'granted') {
      const granted = await requestPushPermission();
      setPushPermission(getNotificationPermission());
      if (!granted) {
        if (onNotify) {
          onNotify('Tono reproducido. Para recibir avisos en pantalla, concede el permiso en tu navegador.');
        }
        return;
      }
    }

    await triggerPushNotification({
      title: 'Seminario Santo Tomás de Aquino',
      body: '¡Sistema de Notificaciones Activo! Recibirás alertas inmediatas cuando respondan tus solicitudes.',
      tag: 'test-push-' + Date.now()
    });

    if (onNotify) {
      onNotify('Notificación y sonido de prueba emitidos correctamente.');
    }
  };

  // Filtrar solo las solicitudes de este seminarista
  const misSolicitudes = solicitudes.filter(s => s.seminaristaId === seminarista?.id);

  // Detección resiliente de aprobaciones/rechazos para alertar al seminarista
  useEffect(() => {
    if (!misSolicitudes || misSolicitudes.length === 0) return;

    let seenMap = {};
    try {
      seenMap = JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || '{}');
    } catch (e) {
      seenMap = {};
    }

    const resueltas = misSolicitudes.filter(
      s => s.estado === 'aprobado' || s.estado === 'rechazado'
    );

    const ahora = Date.now();
    const pendientesDeAlerta = resueltas.filter(s => {
      // Omitir si ya fue guardado en localStorage
      if (seenMap[s.id] === s.estado) return false;
      // Omitir si ya fue alertado en la sesión actual
      if (alertedIdsRef.current.has(`${s.id}-${s.estado}`)) return false;

      const refTime = s.fechaResolucion || s.fechaCreacion;
      const msDiff = refTime ? (ahora - new Date(refTime).getTime()) : 0;
      // Alertar si ocurrió en los últimos 3 días o es reciente
      return msDiff < 3 * 24 * 3600 * 1000;
    });

    if (pendientesDeAlerta.length > 0) {
      const target = pendientesDeAlerta[0];
      alertedIdsRef.current.add(`${target.id}-${target.estado}`);

      // Registrar como vista en localStorage
      seenMap[target.id] = target.estado;
      try {
        localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(seenMap));
      } catch (e) {}

      const esAprobado = target.estado === 'aprobado';
      const titulo = esAprobado
        ? '¡Permiso APROBADO por Rectoría!'
        : 'Solicitud NO Aprobada';

      const cuerpo = target.tipo === 'permiso'
        ? `Tu permiso a "${target.destino || 'destino solicitado'}" ha sido ${esAprobado ? 'APROBADO' : 'RECHAZADO'}.${target.observacionRector ? ` Observación: "${target.observacionRector}"` : ''}`
        : `Tu ${target.tipo} ha sido ${esAprobado ? 'aprobada' : 'revisada'}.${target.observacionRector ? ` Nota: "${target.observacionRector}"` : ''}`;

      // 1. Notificación push nativa en el dispositivo
      triggerPushNotification({
        title: titulo,
        body: cuerpo,
        tag: `sol-${target.id}-${target.estado}`,
        url: '/'
      });

      // 2. Chime de audio Web Audio API
      playNotificationChime(esAprobado ? 'success' : 'alert');

      // 3. Modal interactivo en pantalla
      setAlertaResolucion(target);

      // 4. Toast general
      if (onNotify) {
        onNotify(cuerpo);
      }
    }
  }, [misSolicitudes, NOTIF_SEEN_KEY, onNotify]);

  const solicitudesFiltradas = misSolicitudes.filter(s => {
    if (filtroTipo === 'todos') return true;
    return s.tipo === filtroTipo;
  });

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas cancelar esta solicitud pendiente?')) {
      await eliminarSolicitud(id);
      if (onNotify) onNotify('Solicitud cancelada exitosamente.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Tarjeta de Perfil del Seminarista */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-serif font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-amber-300/40 flex-shrink-0">
              {seminarista?.nombre?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                  {seminarista?.nombreCompleto || seminarista?.nombre}
                </h1>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  {seminarista?.cedula}
                </span>
              </div>
              <p className="text-sm text-slate-300 font-medium mt-1">
                {seminarista?.curso} • Etapa de {seminarista?.etapa}
              </p>
              <p className="text-xs text-amber-400/90 flex items-center gap-1.5 mt-0.5">
                <span>{formatJurisdiccion(seminarista?.diocesis)}</span>
                {seminarista?.telefono && <span>• Tel: {seminarista.telefono}</span>}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-700">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total enviadas</span>
              <span className="text-2xl font-bold font-serif text-amber-300">{misSolicitudes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner / Estado de Notificaciones Push Nativas */}
      {isPushSupported() && pushPermission !== 'granted' ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Activar Notificaciones Push en este dispositivo
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Recibe avisos inmediatos con sonido en tu móvil o navegador al momento que Rectoría apruebe o rechace tus permisos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleProbarNotificacion}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-sm btn-tactile flex items-center justify-center gap-1.5"
              title="Probar sonido y notificación"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Probar Sonido</span>
            </button>
            <button
              onClick={handleActivarPush}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md btn-tactile whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Activar Notificaciones</span>
            </button>
          </div>
        </div>
      ) : isPushSupported() && pushPermission === 'granted' ? (
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Notificaciones activadas en este dispositivo</span>
          </div>
          <button
            onClick={handleProbarNotificacion}
            className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Probar sonido</span>
          </button>
        </div>
      ) : null}

      {/* Tres Acciones Principales */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          ¿Qué deseas gestionar hoy?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Opción 1: Solicitar Permiso */}
          <div 
            onClick={() => setModalType('permiso')}
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md card-tactile flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 border border-amber-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                Solicitar Permiso de Salida
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                Petición formal para salidas médicas, familiares, pastorales o trámites personales.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Nueva solicitud</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Opción 2: Necesidad de Coordinación */}
          <div 
            onClick={() => setModalType('necesidad')}
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-sky-200/80 hover:border-sky-400 shadow-sm hover:shadow-md card-tactile flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 border border-sky-500/20">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                Necesidad de Coordinación
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                Reportar insumos, reparaciones o requerimientos de liturgia, música, cocina o áreas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700">
              <span>Reportar necesidad</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Opción 3: Propuesta */}
          <div 
            onClick={() => setModalType('propuesta')}
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md card-tactile flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200 border border-emerald-500/20">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                Presentar una Propuesta
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                Iniciativas y proyectos de mejora para la formación, fraternidad o vida comunitaria.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Proponer idea</span>
              <Plus className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* Historial de Solicitudes */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              Mis Solicitudes y Estados
            </h2>
            <p className="text-xs text-slate-500">
              Seguimiento en tiempo real de las respuestas del equipo formador
            </p>
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'permiso', label: 'Permisos' },
              { id: 'necesidad', label: 'Necesidades' },
              { id: 'propuesta', label: 'Propuestas' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFiltroTipo(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap chip-tactile ${
                  filtroTipo === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="mt-4 space-y-3">
          {solicitudesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Aún no tienes solicitudes en esta categoría.</p>
              <p className="text-xs text-slate-400 mt-1">Usa los botones superiores para enviar una nueva solicitud.</p>
            </div>
          ) : (
            solicitudesFiltradas.map(item => {
              const isPermiso = item.tipo === 'permiso';
              const isNecesidad = item.tipo === 'necesidad';
              const isPropuesta = item.tipo === 'propuesta';
              const isAprobado = item.estado === 'aprobado';
              const isPendiente = item.estado === 'pendiente';

              return (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-[border-color,background-color] duration-150 bg-white hover:bg-slate-50/50 flex flex-col gap-3 stagger-item"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${
                        isPermiso 
                          ? 'bg-amber-100 text-amber-800' 
                          : isNecesidad 
                          ? 'bg-sky-100 text-sky-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.tipo}
                      </span>
                      <span className="text-xs text-slate-400">
                        {timeAgo(item.fechaCreacion)}
                      </span>
                    </div>

                    <BadgeEstado estado={item.estado} />
                  </div>

                  {/* Cuerpo del item */}
                  <div>
                    {isPermiso && (
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>Destino: {item.destino}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          Motivo: <span className="font-normal text-slate-700">{item.motivo}</span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> Salida: <strong className="text-slate-800">{formatDateTime(item.fechaSalida)}</strong></span>
                          <span className="flex items-center gap-1.5"><ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Retorno: <strong className="text-slate-800">{formatDateTime(item.fechaRetorno)}</strong></span>
                        </div>
                      </div>
                    )}

                    {isNecesidad && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Área: <span className="text-sky-700">{item.area}</span>
                          <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            item.urgencia === 'alta'
                              ? 'bg-rose-100 text-rose-900 border-rose-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            Urgencia: {item.urgencia}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-700 mt-1">
                          {item.descripcion}
                        </p>
                      </div>
                    )}

                    {isPropuesta && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.titulo}
                        </h4>
                        <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                          Dimensión: {item.dimension}
                        </span>
                        <p className="text-xs text-slate-700 mt-1">
                          {item.detalles}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Observación de Rectoría si existe */}
                  {item.observacionRector && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Nota del Equipo Formador
                      </span>
                      <p className="text-slate-800 font-medium">"{item.observacionRector}"</p>
                    </div>
                  )}

                  {/* Acciones del item */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      {isPermiso && isAprobado && (
                        <button
                          onClick={() => setSelectedPase(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm btn-tactile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Pase Digital Autorizado</span>
                        </button>
                      )}
                    </div>

                    {isPendiente && (
                      <button
                        onClick={() => handleEliminar(item.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 btn-tactile flex items-center gap-1 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modales de Formulario */}
      <SolicitudPermisoModal
        isOpen={modalType === 'permiso'}
        onClose={() => setModalType(null)}
        seminarista={seminarista}
        onSuccess={onNotify}
      />

      <SolicitudNecesidadModal
        isOpen={modalType === 'necesidad'}
        onClose={() => setModalType(null)}
        seminarista={seminarista}
        onSuccess={onNotify}
      />

      <SolicitudPropuestaModal
        isOpen={modalType === 'propuesta'}
        onClose={() => setModalType(null)}
        seminarista={seminarista}
        onSuccess={onNotify}
      />

      {/* Modal Pase Digital Oficial */}
      {selectedPase && (
        <PaseDigitalModal
          isOpen={!!selectedPase}
          onClose={() => setSelectedPase(null)}
          permiso={selectedPase}
          seminarista={seminarista}
        />
      )}

      {/* Modal de Alerta In-App de Resolución (Aprobación / Rechazo) */}
      {alertaResolucion && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolucion-modal-title"
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            {/* Cabecera temática */}
            <div className={`p-6 text-center relative overflow-hidden ${
              alertaResolucion.estado === 'aprobado'
                ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white'
                : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white'
            }`}>
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg border ${
                  alertaResolucion.estado === 'aprobado'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}>
                  {alertaResolucion.estado === 'aprobado' ? (
                    <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-9 h-9 text-rose-400" />
                  )}
                </div>
                <span className={`text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 border ${
                  alertaResolucion.estado === 'aprobado'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                }`}>
                  {alertaResolucion.estado === 'aprobado' ? 'Resolución Favorable' : 'Respuesta de Rectoría'}
                </span>
                <h3 id="resolucion-modal-title" className="text-xl font-serif font-bold text-amber-100">
                  {alertaResolucion.estado === 'aprobado'
                    ? '¡Tu Solicitud ha sido Aprobada!'
                    : 'Solicitud No Aprobada'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">
                  {alertaResolucion.estado === 'aprobado'
                    ? 'El equipo formador ha concedido la autorización solicitada.'
                    : 'El equipo formador ha revisado tu petición.'}
                </p>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold uppercase text-[10px]">Tipo</span>
                  <span className="font-bold text-slate-800 uppercase">{alertaResolucion.tipo}</span>
                </div>

                {alertaResolucion.tipo === 'permiso' && (
                  <>
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/80">
                      <span className="text-slate-500">Destino:</span>
                      <strong className="text-slate-900 text-right">{alertaResolucion.destino}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">Salida:</span>
                      <span className="text-slate-800 text-right">{formatDateTime(alertaResolucion.fechaSalida)}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">Retorno:</span>
                      <span className="text-slate-800 text-right">{formatDateTime(alertaResolucion.fechaRetorno)}</span>
                    </div>
                  </>
                )}

                {alertaResolucion.observacionRector && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Observación / Instrucción del Formador:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 italic bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/30">
                      "{alertaResolucion.observacionRector}"
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 pt-2">
                {alertaResolucion.tipo === 'permiso' && alertaResolucion.estado === 'aprobado' ? (
                  <>
                    <button
                      onClick={() => {
                        const target = alertaResolucion;
                        setAlertaResolucion(null);
                        setSelectedPase(target);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-md btn-tactile flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Pase Digital Oficial</span>
                    </button>
                    <button
                      onClick={() => setAlertaResolucion(null)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs btn-tactile min-h-[44px]"
                    >
                      Cerrar y ver más tarde
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setAlertaResolucion(null)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md btn-tactile min-h-[44px]"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
