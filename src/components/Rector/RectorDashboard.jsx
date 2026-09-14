import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Wrench, 
  Lightbulb, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import GestionPermisos from './GestionPermisos';
import GestionNecesidades from './GestionNecesidades';
import GestionPropuestas from './GestionPropuestas';
import PadronSeminaristas from './PadronSeminaristas';

export default function RectorDashboard({ solicitudes = [], seminaristas = [], onNotify }) {
  const [activeTab, setActiveTab] = useState('permisos'); // 'permisos' | 'necesidades' | 'propuestas' | 'padron'

  // Métricas
  const permisosPendientes = solicitudes.filter(s => s.tipo === 'permiso' && s.estado === 'pendiente').length;
  const necesidadesPendientes = solicitudes.filter(s => s.tipo === 'necesidad' && s.estado !== 'resuelta').length;
  const propuestasPendientes = solicitudes.filter(s => s.tipo === 'propuesta' && s.estado !== 'archivada').length;
  const necesidadesUrgentes = solicitudes.filter(s => s.tipo === 'necesidad' && s.urgencia === 'alta' && s.estado !== 'resuelta').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Banner de Rectoría */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 sm:h-20 w-auto flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Escudo Oficial Seminario Santo Tomás de Aquino - Sacerdos Lux" 
                className="h-full w-auto object-contain filter drop-shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                  Panel de Rectoría y Formadores
                </h1>
                <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  ADMINISTRACIÓN
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Seminario Mayor Santo Tomás de Aquino • Control y Aprobaciones 2026-2027
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Permisos */}
        <div 
          onClick={() => setActiveTab('permisos')}
          className={`p-4 rounded-2xl border cursor-pointer bg-white shadow-sm hover:shadow-md card-tactile ${
            activeTab === 'permisos' ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Permisos</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{permisosPendientes}</span>
            <span className="text-xs text-amber-600 font-semibold">pendientes</span>
          </div>
        </div>

        {/* Necesidades */}
        <div 
          onClick={() => setActiveTab('necesidades')}
          className={`p-4 rounded-2xl border cursor-pointer bg-white shadow-sm hover:shadow-md card-tactile ${
            activeTab === 'necesidades' ? 'border-sky-500 ring-2 ring-sky-400/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Necesidades</span>
            <Wrench className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{necesidadesPendientes}</span>
            {necesidadesUrgentes > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                {necesidadesUrgentes} urgente{necesidadesUrgentes > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">activas</span>
            )}
          </div>
        </div>

        {/* Propuestas */}
        <div 
          onClick={() => setActiveTab('propuestas')}
          className={`p-4 rounded-2xl border cursor-pointer bg-white shadow-sm hover:shadow-md card-tactile ${
            activeTab === 'propuestas' ? 'border-emerald-600 ring-2 ring-emerald-400/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Propuestas</span>
            <Lightbulb className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{propuestasPendientes}</span>
            <span className="text-xs text-emerald-700 font-semibold">por evaluar</span>
          </div>
        </div>

        {/* Padrón */}
        <div 
          onClick={() => setActiveTab('padron')}
          className={`p-4 rounded-2xl border cursor-pointer bg-white shadow-sm hover:shadow-md card-tactile ${
            activeTab === 'padron' ? 'border-slate-800 ring-2 ring-slate-400/30' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seminaristas</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-slate-900">{seminaristas.length}</span>
            <span className="text-xs text-slate-500 font-semibold">matriculados</span>
          </div>
        </div>

      </div>

      {/* Pestañas de Navegación */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('permisos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap btn-tactile ${
            activeTab === 'permisos'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Gestión de Permisos</span>
          {permisosPendientes > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
              {permisosPendientes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('necesidades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap btn-tactile ${
            activeTab === 'necesidades'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4 text-sky-400" />
          <span>Necesidades de Coordinación</span>
          {necesidadesPendientes > 0 && (
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-black text-[10px] flex items-center justify-center">
              {necesidadesPendientes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('propuestas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap btn-tactile ${
            activeTab === 'propuestas'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <span>Propuestas Comunitarias</span>
        </button>

        <button
          onClick={() => setActiveTab('padron')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap btn-tactile ${
            activeTab === 'padron'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-slate-400" />
          <span>Padrón de Seminaristas</span>
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'permisos' && (
          <GestionPermisos
            solicitudes={solicitudes}
            seminaristas={seminaristas}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'necesidades' && (
          <GestionNecesidades
            solicitudes={solicitudes}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'propuestas' && (
          <GestionPropuestas
            solicitudes={solicitudes}
            onNotify={onNotify}
          />
        )}

        {activeTab === 'padron' && (
          <PadronSeminaristas
            seminaristas={seminaristas}
            solicitudes={solicitudes}
            onNotify={onNotify}
          />
        )}
      </div>

    </div>
  );
}
