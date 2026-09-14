import React from 'react';
import { ShieldCheck, Share2, X, Clock, MapPin, Calendar, CheckCircle2, User, Church } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { generatePermisoWhatsAppText, shareViaWhatsApp } from '../../utils/whatsappShare';

export default function PaseDigitalModal({ isOpen, onClose, permiso, seminarista }) {
  if (!isOpen || !permiso) return null;

  const isAprobado = (permiso.estado || '').toLowerCase() === 'aprobado';
  const codigoCert = (permiso.id ? String(permiso.id).slice(-8).toUpperCase() : 'SEMINARIO-AUT');

  const handleShareWhatsApp = () => {
    const text = generatePermisoWhatsAppText(permiso, seminarista);
    shareViaWhatsApp(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-500/40 w-full max-w-md overflow-hidden flex flex-col relative">
        
        {/* Marca de agua / Decoración eclesiástica */}
        <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none text-slate-900">
          <Church className="w-56 h-56" />
        </div>

        {/* Cabecera del Pase */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 text-white text-center border-b-2 border-amber-500 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-2 shadow-inner">
            <Church className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-amber-200">
            Seminario Mayor Santo Tomás de Aquino
          </h3>
          <p className="text-[11px] text-slate-300 font-light">
            Arquidiócesis de Maracaibo
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pase de Salida Autorizado</span>
          </div>
        </div>

        {/* Contenido del Pase */}
        <div className="p-6 space-y-4 text-slate-800">
          
          {/* Ficha del Seminarista */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-800 font-bold flex items-center justify-center font-serif text-lg border border-amber-500/30">
              {seminarista?.nombre?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {seminarista?.nombreCompleto || seminarista?.nombre}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Cédula: <span className="font-mono text-slate-900 font-bold">{seminarista?.cedula}</span>
              </p>
              <p className="text-[11px] text-amber-800 font-semibold">
                {seminarista?.curso} • Diócesis de {seminarista?.diocesis}
              </p>
            </div>
          </div>

          {/* Detalles del Permiso */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Destino</span>
              <div className="flex items-center gap-1 text-slate-900 font-bold">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">{permiso.destino}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tipo</span>
              <span className="font-bold text-slate-800 block truncate">{permiso.tipoPermiso || 'Personal'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Salida</span>
              <span className="font-semibold text-slate-900 text-[11px] block">
                {formatDateTime(permiso.fechaSalida)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Retorno Previsto</span>
              <span className="font-semibold text-slate-900 text-[11px] block">
                {formatDateTime(permiso.fechaRetorno)}
              </span>
            </div>
          </div>

          {/* Motivo */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">Motivo</span>
            <p className="text-slate-800 italic">"{permiso.motivo}"</p>
          </div>

          {/* Observaciones de Rectoría si existen */}
          {permiso.observacionRector && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                Observación / Condición de Rectoría
              </span>
              <p className="text-emerald-900 font-medium">"{permiso.observacionRector}"</p>
            </div>
          )}

          {/* Sello de Validación */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono">
              CERT: #{codigoCert}<br />
              AUTORIZADO POR RECTORÍA
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-600 font-bold">
              OFICIAL 2026-2027
            </div>
          </div>

        </div>

        {/* Botones de Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
