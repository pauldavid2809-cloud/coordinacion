import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  Search, 
  MessageSquare, 
  Eye, 
  Share2, 
  Filter,
  Check,
  X
} from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado';
import { formatDateTime, timeAgo } from '../../utils/formatters';
import { actualizarEstadoSolicitud } from '../../services/firestoreService';
import PaseDigitalModal from '../Seminarista/PaseDigitalModal';

export default function GestionPermisos({ solicitudes = [], seminaristas = [], onNotify }) {
  const [filtroEstado, setFiltroEstado] = useState('pendiente'); // 'todos' | 'pendiente' | 'aprobado' | 'rechazado'
  const [busqueda, setBusqueda] = useState('');
  
  // Modal de acción (Aprobar / Rechazar)
  const [resolviendoItem, setResolviendoItem] = useState(null);
  const [accionTipo, setAccionTipo] = useState('aprobado'); // 'aprobado' | 'rechazado'
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  // Ver pase digital
  const [verPase, setVerPase] = useState(null);

  const permisos = solicitudes.filter(s => s.tipo === 'permiso');

  const permisosFiltrados = permisos.filter(p => {
    // Filtro por estado
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) {
      return false;
    }
    // Filtro por búsqueda
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

  const abrirResolucion = (item, tipo) => {
    setResolviendoItem(item);
    setAccionTipo(tipo);
    setObservacion(item.observacionRector || '');
  };

  const confirmarResolucion = async (e) => {
    e.preventDefault();
    if (!resolviendoItem) return;

    setLoading(true);
    await actualizarEstadoSolicitud(resolviendoItem.id, accionTipo, observacion.trim());
    setLoading(false);

    if (onNotify) {
      onNotify(`Permiso ${accionTipo === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente.`);
    }

    setResolviendoItem(null);
    setObservacion('');
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por seminarista, cédula, curso o destino..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* Listado de Permisos */}
      <div className="space-y-3">
        {permisosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No hay permisos en este filtro.</p>
          </div>
        ) : (
          permisosFiltrados.map(item => {
            const isPendiente = item.estado === 'pendiente';
            const isAprobado = item.estado === 'aprobado';
            const seminaristaObj = seminaristas.find(s => s.id === item.seminaristaId) || {
              nombreCompleto: item.seminaristaNombre,
              cedula: item.seminaristaCedula,
              curso: item.seminaristaCurso,
              diocesis: item.seminaristaDiocesis
            };

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPendiente 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : isAprobado 
                    ? 'border-emerald-200' 
                    : 'border-slate-200'
                }`}
              >
                {/* Datos del Seminarista y Permiso */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BadgeEstado estado={item.estado} />
                    <span className="text-xs font-bold text-slate-900 font-serif">
                      {item.seminaristaNombre}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({item.seminaristaCedula})
                    </span>
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {item.seminaristaCurso}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto md:ml-0">
                      {timeAgo(item.fechaCreacion)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Destino: <strong>{item.destino}</strong></span>
                    <span className="text-xs text-slate-400 font-normal">({item.tipoPermiso || 'Personal'})</span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{item.motivo}"
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
                    <span>🚪 Salida: <strong>{formatDateTime(item.fechaSalida)}</strong></span>
                    <span>⏰ Retorno previsto: <strong>{formatDateTime(item.fechaRetorno)}</strong></span>
                  </div>

                  {item.observacionRector && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong>Observación de Rectoría:</strong> {item.observacionRector}
                    </div>
                  )}
                </div>

                {/* Acciones para el Rector */}
                <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {isPendiente ? (
                    <>
                      <button
                        onClick={() => abrirResolucion(item, 'aprobado')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => abrirResolucion(item, 'rechazado')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isAprobado && (
                        <button
                          onClick={() => setVerPase({ permiso: item, seminarista: seminaristaObj })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Pase</span>
                        </button>
                      )}
                      <button
                        onClick={() => abrirResolucion(item, isAprobado ? 'rechazado' : 'aprobado')}
                        className="text-xs text-slate-400 hover:text-slate-700 underline"
                      >
                        Cambiar estado
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal para Aprobar o Rechazar con Observación */}
      {resolviendoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                accionTipo === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {accionTipo === 'aprobado' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  {accionTipo === 'aprobado' ? 'Aprobar Solicitud de Permiso' : 'Rechazar Solicitud de Permiso'}
                </h3>
                <p className="text-xs text-slate-500">
                  Para: <strong>{resolviendoItem.seminaristaNombre}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={confirmarResolucion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observación o Condición (Opcional)
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder={
                    accionTipo === 'aprobado' 
                      ? 'Ej. Regresar antes del rezo de Completas / Reportarse en portería' 
                      : 'Indica el motivo por el cual no se concede el permiso...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-800 text-sm text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolviendoItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                    accionTipo === 'aprobado' 
                      ? 'bg-emerald-600 hover:bg-emerald-500' 
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {loading ? 'Guardando...' : `Confirmar ${accionTipo === 'aprobado' ? 'Aprobación' : 'Rechazo'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
