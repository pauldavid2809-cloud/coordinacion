import React, { useState } from 'react';
import { Lightbulb, Search, Clock, MessageSquare } from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado';
import { timeAgo, formatDateTime } from '../../utils/formatters';
import { actualizarEstadoSolicitud } from '../../services/firestoreService';

export default function GestionPropuestas({ solicitudes = [], onNotify }) {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  const [editandoItem, setEditandoItem] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('en_revision');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  const propuestas = solicitudes.filter(s => s.tipo === 'propuesta');

  const propuestasFiltradas = propuestas.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const sem = (p.seminaristaNombre || '').toLowerCase();
      const tit = (p.titulo || '').toLowerCase();
      const dim = (p.dimension || '').toLowerCase();
      return sem.includes(q) || tit.includes(q) || dim.includes(q);
    }
    return true;
  });

  const abrirEdicion = (item) => {
    setEditandoItem(item);
    setNuevoEstado(item.estado || 'en_revision');
    setObservacion(item.observacionRector || '');
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!editandoItem) return;

    setLoading(true);
    await actualizarEstadoSolicitud(editandoItem.id, nuevoEstado, observacion.trim());
    setLoading(false);

    if (onNotify) onNotify('Estado de la propuesta actualizado correctamente.');
    setEditandoItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, dimensión o seminarista..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_revision">En Evaluación</option>
          <option value="aprobado">Aprobadas / En Marcha</option>
          <option value="archivada">Archivadas</option>
        </select>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {propuestasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No hay propuestas registradas en este filtro.</p>
          </div>
        ) : (
          propuestasFiltradas.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <BadgeEstado estado={item.estado} />
                  <span className="text-xs font-bold text-slate-900 font-serif">
                    {item.seminaristaNombre}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({item.seminaristaCurso})
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto md:ml-0">
                    {timeAgo(item.fechaCreacion)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  {item.titulo}
                </h4>

                <span className="inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
                  Dimensión: {item.dimension}
                </span>

                <p className="text-xs text-slate-600">
                  <strong>Justificación:</strong> {item.justificacion}
                </p>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Detalles:</strong> {item.detalles}
                </p>

                {item.observacionRector && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                    <strong>Respuesta de Rectoría:</strong> {item.observacionRector}
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <button
                  onClick={() => abrirEdicion(item)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Evaluar Propuesta
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para editar */}
      {editandoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Evaluar Propuesta Comunitaria
            </h3>
            <p className="text-xs text-slate-500">
              Título: <strong>{editandoItem.titulo}</strong>
            </p>

            <form onSubmit={guardarCambios} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_revision">En Evaluación</option>
                  <option value="aprobado">Aprobada / En Ejecución</option>
                  <option value="archivada">Archivada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observación o Respuesta
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Escribe comentarios formativos, indicaciones o aprobación..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditandoItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  {loading ? 'Guardando...' : 'Guardar Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
