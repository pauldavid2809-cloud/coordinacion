import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  Search, 
  Eye, 
  Check, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  FileText
} from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado.jsx';
import { formatDateTime, timeAgo } from '../../utils/formatters.js';
import { actualizarEstadoSolicitud } from '../../services/supabaseService.js';
import PaseDigitalModal from '../Seminarista/PaseDigitalModal.jsx';

// Plantillas de aprobación acordadas con los formadores
const CONDICIONES_APROBACION = [
  { id: 'sin_condicion', label: 'Sin condiciones', texto: 'Aprobado sin condiciones' },
  { id: 'formador', label: 'Reportarse con Padre Formador', texto: 'Reportarse con el Padre Formador al regresar' },
  { id: 'medico', label: 'Presentar constancia médica', texto: 'Presentar constancia o justificativo médico' }
];

// Sugerencias de motivos frecuentes para rechazo
const MOTIVOS_RECHAZO_SUGERIDOS = [
  'Actividad comunitaria prioritaria',
  'Horario o fecha no conveniente',
  'Falta información o justificación insuficiente'
];

export default function GestionPermisos({ solicitudes = [], seminaristas = [], onNotify }) {
  const [filtroEstado, setFiltroEstado] = useState('pendiente'); // 'todos' | 'pendiente' | 'aprobado' | 'rechazado'
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para la tarjeta en modo "Rechazar" (desplegada inline para escribir motivo)
  const [rechazandoId, setRechazandoId] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Estado para menú de notas avanzadas de aprobación
  const [menuAprobacionId, setMenuAprobacionId] = useState(null);
  const [notaPersonalizada, setNotaPersonalizada] = useState('');
  
  // Última acción para deshacer fácilmente
  const [ultimoResuelto, setUltimoResuelto] = useState(null);

  // Ver pase digital
  const [verPase, setVerPase] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const permisos = solicitudes.filter(s => s.tipo === 'permiso');

  const permisosFiltrados = permisos.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
      return false;
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const nombre = (p.seminaristaNombre || '').toLowerCase();
      const cedula = (p.seminaristaCedula || '').toLowerCase();
      const curso = (p.seminaristaCurso || '').toLowerCase();
      const destino = (p.destino || '').toLowerCase();
      return nombre.includes(q) || cedula.includes(q) || curso.includes(q) || destino.includes(q);
    }
    return true;
  });

  // Aprobación rápida (1-clic con o sin condición)
  const handleAprobarRapido = async (item, observacion = '') => {
    setLoadingId(item.id);
    const res = await actualizarEstadoSolicitud(item.id, 'aprobado', observacion);
    setLoadingId(null);
    setMenuAprobacionId(null);
    setNotaPersonalizada('');

    setUltimoResuelto({ id: item.id, estadoAnterior: item.estado, nombre: item.seminaristaNombre });

    if (onNotify) {
      onNotify(`✅ Permiso de ${item.seminaristaNombre} APROBADO.`);
    }
  };

  // Confirmar rechazo con motivo
  const handleConfirmarRechazo = async (item) => {
    if (!motivoRechazo.trim()) {
      alert('Por favor indica el motivo del rechazo.');
      return;
    }
    setLoadingId(item.id);
    await actualizarEstadoSolicitud(item.id, 'rechazado', motivoRechazo.trim());
    setLoadingId(null);
    setRechazandoId(null);
    setMotivoRechazo('');

    setUltimoResuelto({ id: item.id, estadoAnterior: item.estado, nombre: item.seminaristaNombre });

    if (onNotify) {
      onNotify(`❌ Permiso de ${item.seminaristaNombre} rechazado.`);
    }
  };

  // Deshacer acción y devolver a 'pendiente'
  const handleDeshacer = async (item) => {
    setLoadingId(item.id);
    await actualizarEstadoSolicitud(item.id, 'pendiente', '');
    setLoadingId(null);
    setUltimoResuelto(null);
    if (onNotify) {
      onNotify(`Permiso devuelto a estado pendiente.`);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por seminarista, cédula, curso o destino..."
            className="w-full pl-9 pr-4 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-h-[44px]"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'pendiente', label: 'Pendientes' },
            { id: 'aprobado', label: 'Aprobados' },
            { id: 'rechazado', label: 'Rechazados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroEstado(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap chip-tactile ${
                filtroEstado === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Permisos con Aprobación/Rechazo Intuitivo */}
      <div className="space-y-3">
        {permisosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No hay permisos en esta categoría.</p>
          </div>
        ) : (
          permisosFiltrados.map(item => {
            const isPendiente = item.estado === 'pendiente';
            const isAprobado = item.estado === 'aprobado';
            const isRechazado = item.estado === 'rechazado';
            const estaRechazando = rechazandoId === item.id;
            const menuAprobacionAbierto = menuAprobacionId === item.id;
            const isLoading = loadingId === item.id;

            const seminaristaObj = seminaristas.find(s => s.id === item.seminaristaId) || {
              nombreCompleto: item.seminaristaNombre,
              cedula: item.seminaristaCedula,
              curso: item.seminaristaCurso,
              diocesis: item.seminaristaDiocesis
            };

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl border-2 transition-[border-color,background-color,box-shadow] duration-200 shadow-sm flex flex-col gap-4 stagger-item ${
                  isPendiente 
                    ? 'border-amber-200/90 bg-white hover:border-amber-400' 
                    : isAprobado 
                    ? 'border-emerald-300 bg-emerald-50/40' 
                    : 'border-rose-200 bg-rose-50/30'
                }`}
              >
                {/* Cabecera de la tarjeta: Datos del seminarista y estado */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-serif font-black text-lg border ${
                      isAprobado 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : isRechazado 
                        ? 'bg-rose-100 text-rose-800 border-rose-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {item.seminaristaNombre?.charAt(0) || 'S'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                          {item.seminaristaNombre}
                        </h4>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          ({item.seminaristaCedula})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {item.seminaristaCurso} • {item.seminaristaDiocesis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <BadgeEstado estado={item.estado} />
                    <span className="text-[11px] text-slate-400">
                      {timeAgo(item.fechaCreacion)}
                    </span>
                  </div>
                </div>

                {/* Detalles de salida, destino y motivo */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Destino: {item.destino}</span>
                    <span className="text-xs text-slate-500 font-normal">({item.tipoPermiso || 'Personal'})</span>
                  </div>

                  <p className="text-slate-700 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/70 italic text-xs">
                    "{item.motivo}"
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-mono bg-white/80 p-2 rounded-xl border border-slate-100">
                    <span>🚪 Salida: <strong>{formatDateTime(item.fechaSalida)}</strong></span>
                    <span>⏰ Retorno previsto: <strong>{formatDateTime(item.fechaRetorno)}</strong></span>
                  </div>

                  {/* Observación registrada si ya fue resuelto */}
                  {item.observacionRector && (
                    <div className={`p-3 rounded-2xl border text-xs ${
                      isAprobado 
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-medium' 
                        : 'bg-rose-100/70 border-rose-300 text-rose-950 font-medium'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70 mb-0.5">
                        {isAprobado ? 'Condición de Aprobación:' : 'Motivo del Rechazo:'}
                      </span>
                      "{item.observacionRector}"
                    </div>
                  )}
                </div>

                {/* ============================================================ */}
                {/* INTERACCIÓN RÁPIDA E INTUITIVA: ACCIONES PARA EL RECTOR */}
                {/* ============================================================ */}

                {isPendiente && (
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    
                    {/* Botones principales de acción inmediata */}
                    {!estaRechazando && (
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* 1. Botón APROBAR INMEDIATO (1 toque sin rodeos) */}
                        <button
                          onClick={() => handleAprobarRapido(item, 'Aprobado sin condiciones')}
                          disabled={isLoading}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg btn-tactile disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar Directo</span>
                        </button>

                        {/* 2. Botón con Desplegable de Notas Frecuentes de Aprobación */}
                        <button
                          onClick={() => setMenuAprobacionId(menuAprobacionAbierto ? null : item.id)}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold btn-tactile flex items-center gap-1.5"
                          title="Aprobar con condiciones frecuentes"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Condición...</span>
                          {menuAprobacionAbierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* 3. Botón RECHAZAR (despliega redacción de motivo) */}
                        <button
                          onClick={() => {
                            setRechazandoId(item.id);
                            setMenuAprobacionId(null);
                            setMotivoRechazo('');
                          }}
                          disabled={isLoading}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold btn-tactile flex items-center gap-1.5 ml-auto"
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>

                      </div>
                    )}

                    {/* Menú desplegable de notas rápidas de aprobación */}
                    {menuAprobacionAbierto && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-3 animate-slideDown">
                        <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
                          Selecciona una condición de aprobación en 1 toque:
                        </span>
                        
                        <div className="flex flex-wrap gap-2">
                          {CONDICIONES_APROBACION.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleAprobarRapido(item, c.texto)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-600 hover:text-white text-emerald-900 font-semibold border border-emerald-300 chip-tactile text-xs text-left"
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>

                        {/* O escribir nota personalizada */}
                        <div className="pt-2 border-t border-emerald-200 flex gap-2">
                          <input
                            type="text"
                            value={notaPersonalizada}
                            onChange={(e) => setNotaPersonalizada(e.target.value)}
                            placeholder="O escribe otra condición personalizada..."
                            className="flex-1 px-3 py-2 rounded-lg border border-emerald-300 text-base sm:text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-[border-color,box-shadow] duration-150 min-h-[40px]"
                          />
                          <button
                            onClick={() => handleAprobarRapido(item, notaPersonalizada.trim())}
                            disabled={!notaPersonalizada.trim()}
                            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs btn-tactile disabled:opacity-40 min-h-[40px] flex items-center justify-center"
                          >
                            Aprobar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Formulario Inline para Rechazar con Motivo */}
                    {estaRechazando && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-xs space-y-3 animate-slideDown">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Indica el motivo del rechazo</span>
                          </span>
                          <button
                            onClick={() => setRechazandoId(null)}
                            aria-label="Cerrar panel de rechazo"
                            className="text-rose-500 hover:text-rose-800 p-2 btn-tactile rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Chips de sugerencias rápidas */}
                        <div className="flex flex-wrap gap-1.5">
                          {MOTIVOS_RECHAZO_SUGERIDOS.map(motivo => (
                            <button
                              key={motivo}
                              type="button"
                              onClick={() => setMotivoRechazo(motivo)}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-900 font-medium border border-rose-200 text-[11px] chip-tactile min-h-[32px]"
                            >
                              {motivo}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={motivoRechazo}
                          onChange={(e) => setMotivoRechazo(e.target.value)}
                          rows={2}
                          placeholder="Escribe el motivo del rechazo aquí..."
                          className="w-full px-3 py-2.5 rounded-xl border border-rose-300 text-base sm:text-xs text-slate-900 bg-white focus:ring-2 focus:ring-rose-500 transition-[border-color,box-shadow] duration-150"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setRechazandoId(null)}
                            className="px-4 py-2.5 rounded-xl text-rose-800 hover:bg-rose-100 hover:text-rose-950 font-semibold btn-tactile min-h-[44px]"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmarRechazo(item)}
                            disabled={isLoading || !motivoRechazo.trim()}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md btn-tactile disabled:opacity-40 flex items-center gap-1.5 min-h-[44px]"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Confirmar Rechazo</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Acciones para solicitudes ya resueltas: Ver Pase y Botón Deshacer */}
                {!isPendiente && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {isAprobado && (
                        <button
                          onClick={() => setVerPase({ permiso: item, seminarista: seminaristaObj })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 shadow-sm btn-tactile"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ver Pase Digital</span>
                        </button>
                      )}
                    </div>

                    {/* Botón Deshacer / Rectificar */}
                    <button
                      onClick={() => handleDeshacer(item)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 btn-tactile ml-auto"
                      title="Devolver a pendiente si te equivocaste de opción"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Deshacer y volver a pendiente</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Modal Pase Digital para el Rector */}
      {verPase && (
        <PaseDigitalModal
          isOpen={!!verPase}
          onClose={() => setVerPase(null)}
          permiso={verPase.permiso}
          seminarista={verPase.seminarista}
        />
      )}

    </div>
  );
}
