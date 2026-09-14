import React, { useState } from 'react';
import { Wrench, Search, Clock, CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado.jsx';
import { timeAgo, formatDateTime } from '../../utils/formatters.js';
import { actualizarEstadoSolicitud } from '../../services/supabaseService.js';

export default function GestionNecesidades({ solicitudes = [], onNotify }) {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  
  const [editandoItem, setEditandoItem] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('en_revision');
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);

  const necesidades = solicitudes.filter(s => s.tipo === 'necesidad');

  const necesidadesFiltradas = necesidades.filter(n => {
    if (filtroEstado !== 'todos' && n.estado !== filtroEstado) return false;
    if (filtroUrgencia !== 'todos' && n.urgencia !== filtroUrgencia) return false;
    if (filtroArea !== 'todas' && n.area !== filtroArea) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const sem = (n.seminaristaNombre || '').toLowerCase();
      const area = (n.area || '').toLowerCase();
      const desc = (n.descripcion || '').toLowerCase();
      return sem.includes(q) || area.includes(q) || desc.includes(q);
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

    if (onNotify) onNotify('Estado de la necesidad actualizado correctamente.');
    setEditandoItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por área, seminarista o descripción..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_revision">En Revisión</option>
            <option value="resuelta">Atendidas / Resueltas</option>
          </select>

          <select
            value={filtroUrgencia}
            onChange={(e) => setFiltroUrgencia(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
          >
            <option value="todos">Toda urgencia</option>
            <option value="alta">Alta / Urgente</option>
            <option value="baja">Baja</option>
          </select>

          <select
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
          >
            <option value="todas">Todas las coordinaciones</option>
            <option value="Servicios Generales">Servicios Generales</option>
            <option value="Liturgia">Liturgia</option>
            <option value="Cocina">Cocina</option>
            <option value="Cultura">Cultura</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {necesidadesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No hay necesidades en esta categoría.</p>
          </div>
        ) : (
          necesidadesFiltradas.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-[border-color,background-color] duration-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm stagger-item"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <BadgeEstado estado={item.estado} />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.urgencia === 'alta' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Urgencia: {item.urgencia}
                  </span>
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

                <h4 className="text-sm font-bold text-sky-900 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <span>Área: {item.area}</span>
                </h4>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.descripcion}
                </p>

                {item.observacionRector && (
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                    <strong>Respuesta / Gestión de Formadores:</strong> {item.observacionRector}
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <button
                  onClick={() => abrirEdicion(item)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold btn-tactile shadow-sm"
                >
                  Gestionar Estado
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para editar estado */}
      {editandoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 animate-modalIn">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Gestionar Necesidad de Coordinación
            </h3>
            <p className="text-xs text-slate-500">
              Área: <strong>{editandoItem.area}</strong> ({editandoItem.seminaristaNombre})
            </p>

            <form onSubmit={guardarCambios} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm transition-[border-color,box-shadow] duration-150"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_revision">En Revisión / En Proceso</option>
                  <option value="resuelta">Atendida / Resuelta</option>
                  <option value="archivada">Archivada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nota o Respuesta del Equipo Formador
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={3}
                  placeholder="Ej. Comprado el material / Se asignó al equipo de mantenimiento..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm transition-[border-color,box-shadow] duration-150"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditandoItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 btn-tactile"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md btn-tactile"
                >
                  {loading ? 'Guardando...' : 'Guardar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
