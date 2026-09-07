import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/soundEffects';
import AvatarPlaceholder from './AvatarPlaceholder';
import { 
  Trophy, 
  Crown, 
  ArrowRight, 
  Scale, 
  Sparkles, 
  Flame, 
  Heart,
  CheckCircle2
} from 'lucide-react';

export default function SuspenseReveal({ state, onAdvanceToCoordinations, onStartRound2 }) {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const isSuspense = state?.status === 'ROUND_1_SUSPENSE' || state?.status === 'ROUND_2_SUSPENSE';
  const isResults = state?.status === 'ROUND_1_RESULTS' || state?.status === 'ROUND_2_RESULTS';
  const isRound1 = state?.status?.includes('ROUND_1');

  const candidates = isRound1 ? (state?.candidates || []) : (state?.runoffCandidates || []);
  const results = isRound1 ? state?.resultsR1 : state?.resultsR2;
  const winner = state?.winner;
  const isRunoffRequired = isRound1 && !winner && (state?.runoffCandidates?.length >= 2);

  const getSuspenseGridConfig = (count) => {
    if (count <= 2) {
      return {
        containerClass: 'grid grid-cols-2 gap-5 w-full max-w-xl mx-auto pt-2',
        cardClass: 'p-3.5 sm:p-4',
        imageClass: 'w-20 h-20 sm:w-24 sm:h-24',
        nameClass: 'text-xs sm:text-sm'
      };
    }
    if (count === 3) {
      return {
        containerClass: 'grid grid-cols-3 gap-4 w-full max-w-3xl mx-auto pt-2',
        cardClass: 'p-3 sm:p-3.5',
        imageClass: 'w-18 h-18 sm:w-22 sm:h-22',
        nameClass: 'text-xs sm:text-sm'
      };
    }
    if (count === 4) {
      return {
        containerClass: 'grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-w-4xl mx-auto pt-2',
        cardClass: 'p-2.5 sm:p-3',
        imageClass: 'w-16 h-16 sm:w-20 sm:h-20',
        nameClass: 'text-xs sm:text-sm'
      };
    }
    if (count === 5) {
      return {
        containerClass: 'grid grid-cols-3 sm:grid-cols-5 gap-2.5 w-full max-w-5xl mx-auto pt-2',
        cardClass: 'p-2 sm:p-2.5',
        imageClass: 'w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18',
        nameClass: 'text-[11px] sm:text-xs'
      };
    }
    if (count === 6) {
      return {
        containerClass: 'grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-6xl mx-auto pt-2',
        cardClass: 'p-1.5 sm:p-2',
        imageClass: 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16',
        nameClass: 'text-[10px] sm:text-xs'
      };
    }
    return {
      containerClass: 'flex flex-wrap items-stretch justify-center gap-2 w-full max-w-6xl mx-auto pt-2',
      cardClass: 'p-1.5 sm:p-2 flex-1 min-w-[110px] max-w-[150px]',
      imageClass: 'w-12 h-12 sm:w-14 sm:h-14',
      nameClass: 'text-[10px] sm:text-[11px]'
    };
  };

  const suspenseConfig = getSuspenseGridConfig(candidates.length);

  // Suspense cycling animation & sound
  useEffect(() => {
    if (isSuspense) {
      soundEffects.startSuspenseSequence();
      const interval = setInterval(() => {
        setActiveHighlightIndex(prev => (prev + 1) % Math.max(1, candidates.length));
      }, 200);

      return () => {
        clearInterval(interval);
      };
    } else if (isResults) {
      soundEffects.stopSuspenseSequence();
      if (winner) {
        soundEffects.playTriumphFanfare();
        // Number rollup effect
        let current = 0;
        const target = winner.percentage || 0;
        const step = target / 30;
        const rollTimer = setInterval(() => {
          current += step;
          if (current >= target) {
            setDisplayPercentage(target);
            clearInterval(rollTimer);
          } else {
            setDisplayPercentage(Math.round(current));
          }
        }, 30);

        // Triple grand confetti cannon
        try {
          confetti({
            particleCount: 160,
            spread: 100,
            origin: { y: 0.55 },
            colors: ['#FBBF24', '#F59E0B', '#FFFFFF', '#38BDF8', '#818CF8']
          });
          setTimeout(() => {
            confetti({
              particleCount: 100,
              angle: 60,
              spread: 60,
              origin: { x: 0 },
              colors: ['#FBBF24', '#D97706', '#FEF08A']
            });
            confetti({
              particleCount: 100,
              angle: 120,
              spread: 60,
              origin: { x: 1 },
              colors: ['#FBBF24', '#D97706', '#FEF08A']
            });
          }, 350);
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 120,
              origin: { y: 0.4 },
              colors: ['#FBBF24', '#FFFFFF', '#F59E0B']
            });
          }, 700);
        } catch (e) {}

        return () => clearInterval(rollTimer);
      } else if (isRunoffRequired) {
        soundEffects.playRunoffAlert();
      }
    } else {
      soundEffects.stopSuspenseSequence();
    }
  }, [isSuspense, isResults, winner, isRunoffRequired, candidates.length]);

  if (!isSuspense && !isResults) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-1 px-4 my-auto overflow-hidden">
      {/* 1. MODO SUSPENSO: ATMÓSFERA CINEMÁTICA Y LATIDOS */}
      {isSuspense && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full flex flex-col items-center text-center space-y-4 sm:space-y-6"
        >
          {/* Monumental Pulsing Sacred Emblem */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full border border-amber-400/30 animate-aura-slow pointer-events-none"></div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-400 flex items-center justify-center animate-heart-pulse shadow-[0_0_40px_rgba(245,158,11,0.6)]">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
            </div>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Escrutinio Canónico en Computación</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight gold-heading">
              {isRound1 ? '¿Victoria en 1ª Vuelta?' : '¿Quién Gana el Balotaje?'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {isRound1 
                ? 'Verificando si algún hermano alcanza la mayoría calificada del 75% (3/4 de los votos emitidos)...' 
                : 'Definiendo la elección del Coordinador General en votación directa entre los dos finalistas...'}
            </p>
          </div>

          {/* Dynamic 3D Perspective Candidate Cycling */}
          <div className={suspenseConfig.containerClass}>
            {candidates.map((cand, idx) => {
              const isFocused = activeHighlightIndex === idx;
              return (
                <motion.div
                  key={cand.id}
                  animate={{
                    scale: isFocused ? 1.05 : 0.94,
                    opacity: isFocused ? 1 : 0.45,
                    y: isFocused ? -4 : 0
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`rounded-2xl flex flex-col items-center border transition-colors duration-200 ${suspenseConfig.cardClass} ${
                    isFocused
                      ? 'card-senior-gold border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] z-20'
                      : 'bg-slate-950/80 border-white/[0.08]'
                  }`}
                >
                  <div className={`${suspenseConfig.imageClass} rounded-xl overflow-hidden border-2 bg-slate-950 mb-2 shadow-xl transition-all ${
                    isFocused ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-800'
                  }`}>
                    {cand.foto ? (
                      <img src={cand.foto} alt={cand.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarPlaceholder name={cand.nombre} />
                    )}
                  </div>

                  <span className={`font-serif font-bold text-center truncate w-full ${suspenseConfig.nameClass} ${
                    isFocused ? 'text-amber-200' : 'text-slate-400'
                  }`}>
                    {cand.nombre}
                  </span>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-sky-300 mt-1">
                    {cand.curso}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 2. RESULTADOS: HABEMUS COORDINATOREM */}
      {isResults && winner && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.2 }}
          className="w-full flex flex-col items-center text-center space-y-4 sm:space-y-5"
        >
          {/* Proclamation Banner */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-serif font-black text-base sm:text-xl tracking-[0.2em] uppercase gold-heading">
              ¡Habemus Coordinatorem!
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>

          {/* Monumental Winner Card */}
          <div className="relative w-full max-w-xl card-senior-gold rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-widest px-6 py-1 rounded-full shadow-xl border border-white/40">
              Coordinador General Electo • 2026–2027
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 mt-2">
              {/* Portrait */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-950 shrink-0 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                {winner.foto ? (
                  <img src={winner.foto} alt={winner.nombre} className="w-full h-full object-cover" />
                ) : (
                  <AvatarPlaceholder name={winner.nombre} />
                )}
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border border-amber-200">
                  <Crown className="w-5 h-5" />
                </div>
              </div>

              {/* Identity & Rolling Percentage */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                  Seminario Mayor Santo Tomás de Aquino
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                  {winner.nombre}
                </h3>
                <div className="inline-block px-3 py-0.5 rounded-lg bg-blue-950/90 border border-blue-500/40 text-sky-300 text-xs font-bold">
                  {winner.curso}
                </div>

                <div className="pt-3 mt-1 border-t border-white/[0.1] grid grid-cols-2 gap-3">
                  <div className="bg-[#050817] p-2.5 rounded-xl border border-white/[0.08]">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">Votos Obtenidos</span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">{winner.votes || 0}</span>
                  </div>
                  <div className="bg-[#050817] p-2.5 rounded-xl border border-white/[0.08]">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">Mayoría Alcanzada</span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{displayPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voting Breakdown */}
          {results && (
            <div className="w-full max-w-xl card-senior rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <span>Escrutinio General ({results.totalVotes} votos)</span>
                <span className="text-amber-400">Respaldo: {winner.percentage}%</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {results.tally.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/80 border border-white/[0.06]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-slate-500 w-4">#{i+1}</span>
                      <span className="font-bold text-white truncate">{c.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono">
                      <span className="text-slate-300">{c.votes} votos</span>
                      <span className="font-bold text-amber-400 w-12 text-right">{c.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advance Action */}
          {onAdvanceToCoordinations && (
            <button
              onClick={onAdvanceToCoordinations}
              className="btn-gold-senior py-3 px-8 rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-xl"
            >
              <span>Avanzar al Tablero de Coordinaciones</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* 3. RESULTADOS: SEGUNDA VUELTA (BALOTAJE) */}
      {isResults && isRunoffRequired && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.2 }}
          className="w-full flex flex-col items-center text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-rose-950/90 border-2 border-rose-500/50 text-rose-200 text-xs font-bold uppercase tracking-wider shadow-xl">
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span>Mayoría Calificada del 75% No Alcanzada</span>
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white">
              ¡Se Declara Segunda Vuelta!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Ningún hermano obtuvo los 3/4 requeridos ({results?.threshold34} votos). Pasan a balotaje los 2 más votados:
            </p>
          </div>

          {/* Showdown Arena */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl items-center pt-1">
            {state.runoffCandidates.map((cand, idx) => (
              <motion.div
                key={cand.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="card-senior-gold rounded-2xl p-5 flex flex-col items-center text-center space-y-3 shadow-xl"
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Finalista #{idx + 1}
                </div>

                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-xl">
                  {cand.foto ? (
                    <img src={cand.foto} alt={cand.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarPlaceholder name={cand.nombre} />
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                    {cand.nombre}
                  </h3>
                  <span className="text-xs font-semibold text-sky-300 font-mono">
                    {cand.curso}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08] text-xs font-mono">
                  <div className="bg-[#050817] p-2 rounded-lg border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] uppercase block">1ª Vuelta</span>
                    <span className="font-bold text-white text-sm">{cand.votes} votos</span>
                  </div>
                  <div className="bg-[#050817] p-2 rounded-lg border border-white/[0.06]">
                    <span className="text-slate-400 text-[9px] uppercase block">Porcentaje</span>
                    <span className="font-bold text-amber-400 text-sm">{cand.percentage}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {onStartRound2 && (
            <button
              onClick={onStartRound2}
              className="btn-gold-senior py-3 px-8 rounded-xl text-sm flex items-center gap-2 shadow-xl mt-2"
            >
              <span>Abrir Votación de Segunda Vuelta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
