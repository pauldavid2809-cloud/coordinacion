import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socket';
import { soundEffects } from '../utils/soundEffects';
import AvatarPlaceholder from './AvatarPlaceholder';
import Board4Coord from './Board4Coord';
import SuspenseReveal from './SuspenseReveal';
import { 
  Settings, 
  Play, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Users, 
  Crown, 
  Flame, 
  Layers,
  Maximize,
  Minimize
} from 'lucide-react';

const ALL_COURSES = [
  '1° de Filosofía',
  '2° de Filosofía',
  '3° de Filosofía',
  '1° de Teología',
  '2° de Teología',
  '3° de Teología',
  '4° de Teología'
];

export default function TabletAdmin({ state, seminaristas = [] }) {
  const [activeTab, setActiveTab] = useState('MAIN'); // MAIN, ATTENDANCE, SETTINGS
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedCandidateForUpload, setSelectedCandidateForUpload] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
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
  const eligibleCourses = state?.eligibleCourses || ['2° de Teología', '3° de Teología'];
  const votingCourses = state?.votingCourses || ALL_COURSES;
  const totalEligible = state?.totalEligibleVoters || 38;
  const isRound1Voting = status === 'ROUND_1_VOTING';
  const isRound2Voting = status === 'ROUND_2_VOTING';
  const isCoordinations = status === 'COORDINATIONS';

  const currentVotesCount = isRound1Voting ? (state?.r1VoteCount || 0) : (state?.r2VoteCount || 0);
  const votedIds = isRound1Voting ? (state?.r1VotedIds || []) : (state?.r2VotedIds || []);
  const participationPct = totalEligible > 0 ? Math.round((currentVotesCount / totalEligible) * 100) : 0;

  // Handlers
  const handleToggleEligibleCourse = (course) => {
    soundEffects.playClick();
    const updated = eligibleCourses.includes(course)
      ? eligibleCourses.filter(c => c !== course)
      : [...eligibleCourses, course];
    if (updated.length === 0) return;
    socket.emit('election:update_config', { eligibleCourses: updated });
  };

  const handleToggleVotingCourse = (course) => {
    soundEffects.playClick();
    const updated = votingCourses.includes(course)
      ? votingCourses.filter(c => c !== course)
      : [...votingCourses, course];
    if (updated.length === 0) return;
    socket.emit('election:update_config', { votingCourses: updated });
  };

  const handleStartRound1 = () => {
    soundEffects.playClick();
    socket.emit('election:start_round_1');
  };

  const handleTriggerSuspense = (round = 1) => {
    soundEffects.playClick();
    socket.emit('election:trigger_suspense', { round });
  };

  const handleRevealResults = (round = 1) => {
    soundEffects.playClick();
    socket.emit('election:reveal_results', { round });
  };

  const handleStartRound2 = () => {
    soundEffects.playClick();
    socket.emit('election:start_round_2');
  };

  const handleGoToCoordinations = () => {
    soundEffects.playClick();
    socket.emit('election:go_to_coordinations');
  };

  const handleResetElection = () => {
    if (window.confirm('¿Reiniciar todo el proceso electoral? Se borrarán los votos registrados.')) {
      soundEffects.playClick();
      socket.emit('election:reset');
    }
  };

  const triggerPhotoUpload = (candidateId) => {
    setSelectedCandidateForUpload(candidateId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCandidateForUpload) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('candidateId', selectedCandidateForUpload);

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        soundEffects.playSuccess();
      }
    } catch (err) {
      console.error('Error al subir foto:', err);
    } finally {
      setIsUploadingPhoto(false);
      setSelectedCandidateForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col p-2 sm:p-2.5 max-w-[1800px] mx-auto select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header - Compact single-row command strip */}
      <div className="flex items-center justify-between gap-3 card-senior-gold rounded-xl px-3.5 py-1.5 shrink-0 shadow-md border border-amber-400/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-sm shrink-0">
            <Crown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-serif font-black text-white leading-tight truncate">
              Mando del Padre Rector
            </h1>
            <span className="text-[10px] text-slate-300 font-medium block truncate">
              Seminario Mayor Santo Tomás de Aquino • 2026–2027
            </span>
          </div>
        </div>

        {/* Sliding Tab Switcher with Framer Motion & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040714] border border-white/[0.08]">
            {[
              { id: 'MAIN', label: 'Fase Actual' },
              { id: 'ATTENDANCE', label: `Padrón (${votedIds.length}/${totalEligible})` },
              { id: 'SETTINGS', label: 'Cursos & Fotos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors z-10 ${
                  activeTab === tab.id ? 'text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="adminTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleResetElection}
            title="Reiniciar Elección"
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/50 border border-rose-500/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Main Tab */}
      {activeTab === 'MAIN' && (
        <div className={`flex-1 min-h-0 flex flex-col pt-2 ${isCoordinations ? 'h-full overflow-hidden' : 'space-y-4 overflow-y-auto custom-scrollbar p-1'}`}>
          {/* FASE 1: CONFIG */}
          {status === 'CONFIG' && (
            <div className="card-senior rounded-3xl p-8 text-center space-y-6 shadow-2xl my-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-900/40 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Settings className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">Preparación de Asamblea</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Verifica que los 4 candidatos y las fotos estén listos antes de abrir la votación de 1ª Vuelta.
                </p>
              </div>

              {/* Candidates preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {candidates.map(cand => (
                  <div key={cand.id} className="p-3.5 rounded-2xl bg-[#050817] border border-white/[0.08] text-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto border border-amber-400/40 mb-2 bg-slate-950 shadow-md">
                      {cand.foto ? (
                        <img src={cand.foto} alt={cand.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarPlaceholder name={cand.nombre} />
                      )}
                    </div>
                    <span className="text-xs font-serif font-bold text-white block truncate">{cand.nombre}</span>
                    <span className="text-[10px] font-mono text-sky-300">{cand.curso}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 max-w-sm mx-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartRound1}
                  className="btn-gold-senior w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2.5 shadow-xl"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>Abrir Votación de 1ª Vuelta</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* FASE 2: VOTACIÓN 1ª VUELTA */}
          {isRound1Voting && (
            <div className="card-senior-gold rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl my-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/40">
                    Votación Abierta en Móviles
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1.5">
                    1ª Vuelta en Progreso
                  </h2>
                  <p className="text-xs text-slate-300">
                    Los 38 seminaristas están habilitados para votar desde sus teléfonos.
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                    {currentVotesCount} / {totalEligible}
                  </span>
                  <span className="text-xs text-slate-400 block font-medium mt-0.5">votos computados ({participationPct}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#040714] rounded-full h-4 p-0.5 border border-white/[0.08] overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-md"
                  style={{ width: `${Math.min(100, participationPct)}%` }}
                ></div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTriggerSuspense(1)}
                  className="btn-gold-senior w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2.5 shadow-xl"
                >
                  <Flame className="w-5 h-5 text-slate-950" />
                  <span>Cerrar Votación & Activar Modo Suspenso en TV</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* FASE 3: MODO SUSPENSO 1ª VUELTA */}
          {status === 'ROUND_1_SUSPENSE' && (
            <div className="card-senior-gold rounded-3xl p-8 text-center space-y-5 shadow-2xl my-auto">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center mx-auto animate-heart-pulse">
                <Flame className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">Modo Gran Suspenso en TV</h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  La pantalla grande está proyectando la alternancia de candidatos, foco cenital y latidos cardíacos.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRevealResults(1)}
                className="btn-gold-senior py-3.5 px-8 rounded-2xl text-base flex items-center justify-center gap-2 mx-auto shadow-xl"
              >
                <Eye className="w-5 h-5" />
                <span>Revelar Resultados Oficiales en Pantalla</span>
              </motion.button>
            </div>
          )}

          {/* FASE 4: RESULTADOS 1ª VUELTA */}
          {status === 'ROUND_1_RESULTS' && (
            <div className="card-senior rounded-3xl p-6 space-y-5 shadow-2xl">
              <SuspenseReveal 
                state={state} 
                onAdvanceToCoordinations={handleGoToCoordinations} 
                onStartRound2={handleStartRound2} 
              />
            </div>
          )}

          {/* FASE 5: VOTACIÓN 2ª VUELTA */}
          {isRound2Voting && (
            <div className="card-senior-gold rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl my-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-300 bg-rose-950/90 px-3.5 py-1.5 rounded-full border border-rose-500/40">
                    Segunda Vuelta • Balotaje
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1.5">
                    Votación Definitiva en Curso
                  </h2>
                  <p className="text-xs text-slate-300">
                    Desempate entre los dos candidatos finalistas.
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-4xl sm:text-5xl font-black text-rose-400 tracking-tight">
                    {state?.r2VoteCount || 0} / {totalEligible}
                  </span>
                  <span className="text-xs text-slate-400 block font-medium mt-0.5">votos computados</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTriggerSuspense(2)}
                className="btn-gold-senior w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl"
              >
                <Flame className="w-5 h-5" />
                <span>Cerrar 2ª Vuelta & Activar Suspenso en TV</span>
              </motion.button>
            </div>
          )}

          {/* FASE 6: SUSPENSO 2ª VUELTA */}
          {status === 'ROUND_2_SUSPENSE' && (
            <div className="card-senior-gold rounded-3xl p-8 text-center space-y-5 shadow-2xl my-auto">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">Suspenso de Segunda Vuelta</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Presiona para proclamar al Coordinador General definitivo en pantalla grande.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRevealResults(2)}
                className="btn-gold-senior py-3.5 px-8 rounded-2xl text-base flex items-center justify-center gap-2 mx-auto shadow-xl"
              >
                <Crown className="w-5 h-5" />
                <span>Proclamar al Coordinador General Electo</span>
              </motion.button>
            </div>
          )}

          {/* FASE 7: RESULTADOS 2ª VUELTA */}
          {status === 'ROUND_2_RESULTS' && (
            <div className="card-senior rounded-3xl p-6 space-y-5 shadow-2xl">
              <SuspenseReveal 
                state={state} 
                onAdvanceToCoordinations={handleGoToCoordinations} 
              />
            </div>
          )}

          {/* FASE 8: ASIGNACIÓN DE COORDINACIONES - FITS 100% IN ONE PAGE */}
          {isCoordinations && (
            <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
              <Board4Coord 
                state={state} 
                seminaristas={seminaristas} 
                isTabletAdmin={true} 
              />
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'ATTENDANCE' && (
        <div className="card-senior rounded-2xl p-4 sm:p-6 space-y-4 flex-1 min-h-0 flex flex-col shadow-2xl overflow-hidden mt-2 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Control de Padrón Electoral ({votedIds.length} de {totalEligible} sufragaron)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 flex-1 min-h-0 overflow-y-auto custom-scrollbar p-1">
            {seminaristas.map(s => {
              const hasVoted = votedIds.includes(s.id);
              const isEligibleVoter = votingCourses.includes(s.curso);

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                    hasVoted
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : !isEligibleVoter
                      ? 'bg-black/30 border-white/[0.04] text-slate-600 opacity-50'
                      : 'bg-[#050817] border-white/[0.08] text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-serif font-bold text-white block truncate">{s.nombre}</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.curso} • {s.cedula}</span>
                  </div>

                  <div className="shrink-0">
                    {hasVoted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Votó</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        <Clock className="w-3 h-3" />
                        <span>Pendiente</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'SETTINGS' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 p-1 mt-2 animate-fadeIn">
          {/* Candidate Photos */}
          <div className="card-senior-gold rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-serif font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Fotografías de Candidatos Elegibles ({candidates.length})</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sube una imagen o tómale una foto directa para la transmisión en el televisor.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {candidates.map(cand => (
                <div
                  key={cand.id}
                  className="bg-[#050817] border border-white/[0.08] rounded-xl p-3.5 flex flex-col items-center text-center space-y-2.5 shadow-md"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-400/40 bg-slate-950 shadow-md">
                    {cand.foto ? (
                      <img src={cand.foto} alt={cand.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarPlaceholder name={cand.nombre} />
                    )}
                  </div>
                  <div className="w-full">
                    <span className="text-xs font-serif font-bold text-white block truncate">
                      {cand.nombre}
                    </span>
                    <span className="text-[10px] font-mono text-sky-300 font-semibold">
                      {cand.curso}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => triggerPhotoUpload(cand.id)}
                    disabled={isUploadingPhoto}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{cand.foto ? 'Cambiar Foto' : 'Cargar Foto'}</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* Courses Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-senior rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Cursos Elegibles a Coordinador</span>
              </h3>
              <div className="space-y-1.5 pt-1">
                {ALL_COURSES.map(course => {
                  const isChecked = eligibleCourses.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => handleToggleEligibleCourse(course)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm' 
                          : 'bg-[#040714] border-white/[0.06] text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold">{course}</span>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-amber-400' : 'text-slate-700'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card-senior rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Cursos con Derecho a Voto</span>
              </h3>
              <div className="space-y-1.5 pt-1">
                {ALL_COURSES.map(course => {
                  const isChecked = votingCourses.includes(course);
                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => handleToggleVotingCourse(course)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? 'bg-blue-950/50 border-sky-500/50 text-white shadow-sm' 
                          : 'bg-[#040714] border-white/[0.06] text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold">{course}</span>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-sky-400' : 'text-slate-700'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
