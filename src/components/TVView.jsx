import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SuspenseReveal from './SuspenseReveal';
import Board4Coord from './Board4Coord';
import AvatarPlaceholder from './AvatarPlaceholder';
import { 
  Crown, 
  Activity, 
  CheckCircle2, 
  Flame, 
  Scale, 
  Shield, 
  Sparkles,
  Users,
  GraduationCap,
  Maximize,
  Minimize
} from 'lucide-react';

export default function TVView({ state, seminaristas = [] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const status = state?.status || 'CONFIG';
  const candidates = state?.candidates || [];
  const isRound1Voting = status === 'ROUND_1_VOTING';
  const isRound2Voting = status === 'ROUND_2_VOTING';
  const isSuspenseOrResults = status.includes('SUSPENSE') || status.includes('RESULTS');
  const isCoordinations = status === 'COORDINATIONS';

  const totalEligible = state?.totalEligibleVoters || 38;
  const currentVotesCount = isRound1Voting ? (state?.r1VoteCount || 0) : (state?.r2VoteCount || 0);
  const participationPct = totalEligible > 0 ? Math.round((currentVotesCount / totalEligible) * 100) : 0;
  const votesRemaining = Math.max(0, totalEligible - currentVotesCount);
  const threshold34 = Math.ceil(totalEligible * 0.75);

  // SVG circular gauge
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (participationPct / 100) * circumference;

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between max-w-[1780px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 overflow-hidden select-none">
      {/* Background Cathedral Spotlight */}
      <div className="spotlight-cathedral"></div>

      {/* Unified TV Broadcast Top Bar */}
      <header className="w-full flex items-center justify-between gap-4 pb-2.5 border-b border-white/[0.08] shrink-0 z-20">
        {/* Left: Crest & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            <img 
              src="/logo.svg" 
              alt="Escudo Santo Tomás de Aquino" 
              className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm sm:text-base tracking-wide text-white">
                Seminario Mayor Santo Tomás de Aquino
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/25">
                2026–2027
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium block">
              {isCoordinations 
                ? 'Tablero General de Coordinaciones Pastorales • Arquidiócesis de Maracaibo' 
                : isSuspenseOrResults 
                ? 'Escrutinio Canónico & Proclamación del Coordinador General' 
                : 'Asamblea Electiva Solemne • Elección del Coordinador General'}
            </span>
          </div>
        </div>

        {/* Right: Telemetry / Status & Fullscreen Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Status Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wider uppercase">
              {isRound1Voting ? '1ª Vuelta en Vivo' : 
               isRound2Voting ? '2ª Vuelta (Balotaje)' : 
               isCoordinations ? 'Distribución Pastoral' : 
               status.includes('SUSPENSE') ? 'Suspenso Canónico' : 
               status.includes('RESULTS') ? 'Resultados Oficiales' : 'Sesión Abierta'}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {/* 1. MODO SUSPENSO Y RESULTADOS */}
          {isSuspenseOrResults && (
            <motion.div 
              key="suspense-results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-center z-10 overflow-hidden my-auto w-full"
            >
              <SuspenseReveal state={state} />
            </motion.div>
          )}

          {/* 2. MODO DISTRIBUCIÓN DE LAS 4 COORDINACIONES */}
          {isCoordinations && (
            <motion.div 
              key="coordinations"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="flex-1 min-h-0 flex flex-col w-full z-10 pt-1.5 overflow-hidden"
            >
              <Board4Coord 
                state={state} 
                seminaristas={seminaristas} 
                isTabletAdmin={false} 
              />
            </motion.div>
          )}

          {/* 3. MODO VOTACIÓN ACTIVA O PREPARATORIA */}
          {!isSuspenseOrResults && !isCoordinations && (
            <motion.div 
              key="voting-arena"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="flex-1 min-h-0 flex flex-col justify-between py-1.5 space-y-3 z-10"
            >
              {/* Telemetry & Regulatory Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center flex-1 min-h-0 my-auto">
                {/* Left: Circular Telemetry Gauge */}
                <div className="lg:col-span-5 card-senior-gold rounded-2xl p-5 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 mb-2">
                    <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Escrutinio Canónico en Tiempo Real</span>
                  </div>

                  {/* SVG Dial */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 190 190">
                      <circle
                        cx="95"
                        cy="95"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      <circle
                        cx="95"
                        cy="95"
                        r={radius}
                        stroke="url(#tvGoldRing)"
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                      <defs>
                        <linearGradient id="tvGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FEF08A" />
                          <stop offset="40%" stopColor="#FBBF24" />
                          <stop offset="70%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Inner Counter */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                        {participationPct}%
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Participación
                      </span>
                    </div>
                  </div>

                  {/* Subtitle Metrics */}
                  <div className="mt-2 pt-3 border-t border-white/[0.08] w-full flex items-center justify-around">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Emitidos</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">{currentVotesCount}</span>
                    </div>
                    <div className="h-7 w-px bg-white/[0.1]"></div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Padrón</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-white">{totalEligible}</span>
                    </div>
                    <div className="h-7 w-px bg-white/[0.1]"></div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Faltantes</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-slate-400">{votesRemaining}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Statutory Canonical Rules */}
                <div className="lg:col-span-7 flex flex-col space-y-3">
                  <div className="card-senior rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-serif font-black text-white leading-tight">
                            Régimen Electoral Canónico
                          </h3>
                          <span className="text-xs text-slate-400 font-medium">Mayoría Calificada Constitucional</span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-950/90 border border-blue-500/40 text-sky-300 text-xs font-mono font-bold shadow-md">
                        Umbral 75%: {threshold34} votos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#070D1F] border border-white/[0.08] space-y-1">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Regla de 3/4 de Votos</span>
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          El candidato que alcance el 75% de los sufragios es proclamado Coordinador General en 1ª Vuelta.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#070D1F] border border-white/[0.08] space-y-1">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <Flame className="w-4 h-4" />
                          <span>Segunda Vuelta (Balotaje)</span>
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Si ningún hermano alcanza los 3/4, van a balotaje los 2 candidatos con mayor votación.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-200">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Voto directo, secreto y verificado en red local.</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-300">{totalEligible} seminaristas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Candidates Showcase Podiums */}
              <div className="space-y-2 shrink-0 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm sm:text-base font-serif font-black text-white">
                      Candidatos Elegibles a Coordinador General
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                    2° y 3° de Teología
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {candidates.map((cand) => (
                    <motion.div
                      key={cand.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="card-senior group relative rounded-2xl p-3 sm:p-3.5 flex flex-col items-center text-center space-y-2 shadow-xl"
                    >
                      {/* Portrait Frame */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-400 bg-slate-950 shadow-xl transition-colors duration-300">
                        {cand.foto ? (
                          <img 
                            src={cand.foto} 
                            alt={cand.nombre} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <AvatarPlaceholder name={cand.nombre} />
                        )}
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></div>
                      </div>

                      <div className="w-full">
                        <h3 className="font-serif font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                          {cand.nombre}
                        </h3>
                        <span className="inline-block mt-0.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-500/30">
                          {cand.curso}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
