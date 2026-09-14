import React, { useState } from 'react';
import { 
  Calendar, 
  Wrench, 
  Lightbulb, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Trash2, 
  Eye, 
  Plus, 
  Filter 
} from 'lucide-react';
import BadgeEstado from '../Common/BadgeEstado';
import SolicitudPermisoModal from './SolicitudPermisoModal';
import SolicitudNecesidadModal from './SolicitudNecesidadModal';
import SolicitudPropuestaModal from './SolicitudPropuestaModal';
import PaseDigitalModal from './PaseDigitalModal';
import { formatDateTime, timeAgo } from '../../utils/formatters';
import { eliminarSolicitud } from '../../services/firestoreService';

export default function SeminaristaDashboard({ seminarista, solicitudes = [], onNotify }) {
  const [modalType, setModalType] = useState(null); // 'permiso' | 'necesidad' | 'propuesta'
  const [selectedPase, setSelectedPase] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'permiso' | 'necesidad' | 'propuesta'

  // Filtrar solo las solicitudes de este seminarista
  const misSolicitudes = solicitudes.filter(s => s.seminaristaId === seminarista?.id);

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
                <span>Diócesis de {seminarista?.diocesis}</span>
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

      {/* Tres Acciones Principales */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          ¿Qué deseas gestionar hoy?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Opción 1: Solicitar Permiso */}
          <div 
            onClick={() => setModalType('permiso')}
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-amber-500/20">
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
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-sky-200/80 hover:border-sky-400 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-sky-500/20">
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
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-indigo-200/80 hover:border-indigo-400 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-indigo-500/20">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                Presentar una Propuesta
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                Iniciativas y proyectos de mejora para la formación, fraternidad o vida comunitaria.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all bg-white hover:bg-slate-50/50 flex flex-col gap-3"
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
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span>🚪 Salida: <strong>{formatDateTime(item.fechaSalida)}</strong></span>
                          <span>⏰ Retorno: <strong>{formatDateTime(item.fechaRetorno)}</strong></span>
                        </div>
                      </div>
                    )}

                    {isNecesidad && (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          Área: <span className="text-sky-700">{item.area}</span>
                          <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.urgencia === 'alta' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
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
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Pase Digital Autorizado</span>
                        </button>
                      )}
                    </div>

                    {isPendiente && (
                      <button
                        onClick={() => handleEliminar(item.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
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

    </div>
  );
}
