import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function BadgeEstado({ estado }) {
  const normalized = (estado || 'pendiente').toLowerCase();

  switch (normalized) {
    case 'aprobado':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Aprobado
        </span>
      );
    case 'rechazado':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <XCircle className="w-3.5 h-3.5" />
          Rechazado
        </span>
      );
    case 'en_revision':
    case 'en revision':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
          <Clock className="w-3.5 h-3.5" />
          En Revisión
        </span>
      );
    case 'resuelta':
    case 'atendida':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          Atendida / Resuelta
        </span>
      );
    case 'archivada':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          Archivada
        </span>
      );
    case 'pendiente':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          Pendiente
        </span>
      );
  }
}
