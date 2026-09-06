import React from 'react';
import { motion } from 'framer-motion';
import { Tv, Tablet, Smartphone, Radio, Activity } from 'lucide-react';

export default function HeaderBanner({ role = 'tv', status = 'CONFIG' }) {
  const getStatusBadge = () => {
    switch (status) {
      case 'CONFIG': 
        return { label: 'SESIÓN PREPARATORIA', dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'ROUND_1_VOTING': 
        return { label: '1ª VUELTA EN CURSO', dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' };
      case 'ROUND_1_SUSPENSE': 
      case 'ROUND_2_SUSPENSE': 
        return { label: 'ESCRUTINIO EN SUSPENSO', dot: 'bg-amber-400 animate-ping', badge: 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' };
      case 'ROUND_1_RESULTS': 
      case 'ROUND_2_RESULTS': 
        return { label: 'RESULTADOS OFICIALES', dot: 'bg-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'ROUND_2_VOTING': 
        return { label: '2ª VUELTA • BALOTAJE', dot: 'bg-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]' };
      case 'COORDINATIONS': 
        return { label: 'DISTRIBUCIÓN PASTORAL', dot: 'bg-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default: 
        return { label: 'ASAMBLEA ELECTIVA', dot: 'bg-slate-400', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <header className="w-full bg-[#040714]/85 border-b border-white/[0.08] backdrop-blur-2xl sticky top-0 z-50 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Crest & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Escudo Santo Tomás de Aquino" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.35)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm sm:text-base tracking-wide text-white">
                Seminario Santo Tomás de Aquino
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25 hidden md:inline">
                2026–2027
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-tight">
              Arquidiócesis de Maracaibo • Elección de Coordinador General
            </span>
          </div>
        </div>

        {/* Right: Live Telemetry & Role Indicator */}
        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          <div className={`text-[10px] sm:text-xs font-mono font-bold px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all ${statusInfo.badge}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
            <span>{statusInfo.label}</span>
          </div>

          {/* Role Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300">
            {role === 'tv' && <><Tv className="w-3.5 h-3.5 text-amber-400" /><span>Televisor</span></>}
            {role === 'admin' && <><Tablet className="w-3.5 h-3.5 text-sky-400" /><span>Padre Rector</span></>}
            {role === 'voter' && <><Smartphone className="w-3.5 h-3.5 text-emerald-400" /><span>Móvil</span></>}
          </div>
        </div>
      </div>
    </header>
  );
}
