import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socket';
import { soundEffects } from '../utils/soundEffects';
import AvatarPlaceholder from './AvatarPlaceholder';
import Board4Coord from './Board4Coord';
import SuspenseReveal from './SuspenseReveal';
import { generateOrdenDeLaCasaPDF } from '../utils/pdfGenerator';
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
  Minimize,
  FileDown,
  AlertCircle,
  X,
  Check,
  UserCheck,
  UserX,
  Loader2
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isStartingRound1, setIsStartingRound1] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      soundEffects.playClick();
      await generateOrdenDeLaCasaPDF({ state, seminaristas });
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
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
  const selectedCandidateIds = state?.selectedCandidateIds || candidates.map(c => c.id);
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
    if (updated.length === 0) {
      alert('Debe haber al menos un curso elegible para elegir candidatos.');
      return;
    }
    socket.emit('election:update_config', { eligibleCourses: updated }, (res) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleToggleVotingCourse = (course) => {
    soundEffects.playClick();
    const updated = votingCourses.includes(course)
      ? votingCourses.filter(c => c !== course)
      : [...votingCourses, course];
    if (updated.length === 0) {
      alert('Debe haber al menos un curso habilitado para votar.');
      return;
    }
    socket.emit('election:update_config', { votingCourses: updated }, (res) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleToggleCandidate = (seminaristaId) => {
    soundEffects.playClick();
    socket.emit('election:toggle_candidate', { seminaristaId }, (res) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleSelectAllInCourse = (course, selectAll = true) => {
    soundEffects.playClick();
    const courseSeminaristas = seminaristas.filter(s => s.curso === course);
    const courseSemIds = courseSeminaristas.map(s => s.id);
    let updatedSelected = [...selectedCandidateIds];

    if (selectAll) {
      courseSemIds.forEach(id => {
        if (!updatedSelected.includes(id)) updatedSelected.push(id);
      });
    } else {
      updatedSelected = updatedSelected.filter(id => !courseSemIds.includes(id));
    }

    socket.emit('election:update_config', { selectedCandidateIds: updatedSelected }, (res) => {
      if (res?.error) alert(res.error);
    });
  };

  const handleStartRound1 = () => {
    if (candidates.length < 2) {
      alert('Se requieren al menos 2 candidatos seleccionados para abrir la votación de 1ª Vuelta.');
      return;
    }

    if (!socket.connected) {
      alert('Sin conexión con el servidor backend. Verifica que el servidor esté activo.');
      return;
    }

    soundEffects.playClick();
    setIsStartingRound1(true);
    socket.emit('election:start_round_1', (res) => {
      setIsStartingRound1(false);
      if (res?.error) {
        alert(res.error);
      } else {
        soundEffects.playSuccess();
      }
    });
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
    if (window.confirm('¿Reiniciar todo el proceso electoral? Se borrarán los votos registrados y volverás a la fase de configuración.')) {
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
          <img 
            src="/logo.png" 
            alt="Escudo Santo Tomás de Aquino" 
            className="w-8 h-8 object-contain drop-shadow-md shrink-0" 
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-serif font-black text-white leading-tight truncate">
                Mando del Padre Rector
              </h1>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">En Línea</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[10px] font-mono font-bold shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Desconectado</span>
                </span>
              )}
            </div>
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
              { id: 'SETTINGS', label: 'Cursos & Personas' }
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            title="Descargar Orden de la Casa Oficial en PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}</span>
          </motion.button>

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
            <div className="card-senior rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl my-auto max-w-4xl mx-auto w-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-900/40 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Settings className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="max-w-lg mx-auto space-y-1">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">Preparación de Asamblea</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Configura los cursos y las personas específicas que participarán como candidatos a Coordinador General.
                </p>
              </div>

              {/* Status summary pill & Quick action */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
                  {candidates.length} {candidates.length === 1 ? 'Candidato Seleccionado' : 'Candidatos Seleccionados'}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-sky-500/30 text-sky-300 text-xs font-mono font-medium">
                  Cursos: {eligibleCourses.join(', ') || 'Ninguno'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('SETTINGS')}
                  className="px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-white text-xs font-bold transition-colors"
                >
                  ⚙️ Configurar Cursos y Personas
                </button>
              </div>

              {/* Warning if less than 2 candidates */}
              {candidates.length < 2 && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Se requieren al menos 2 candidatos activos para abrir la votación (actualmente: {candidates.length}).</span>
                </div>
              )}

              {/* Candidates preview */}
              <div className={`grid gap-3.5 max-w-3xl mx-auto w-full ${
                candidates.length <= 2 
                  ? 'grid-cols-2 max-w-md' 
                  : candidates.length === 3 
                  ? 'grid-cols-3 max-w-2xl' 
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}>
                {candidates.map(cand => (
                  <div key={cand.id} className="relative group p-3 rounded-2xl bg-[#050817] border border-white/[0.08] hover:border-amber-400/40 transition-all text-center shadow-md">
                    {/* Quick remove button */}
                    <button
                      type="button"
                      onClick={() => handleToggleCandidate(cand.id)}
                      title="Excluir a este seminarista de los candidatos"
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 flex items-center justify-center text-[10px] transition-all opacity-70 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>

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
                  disabled={candidates.length < 2 || isStartingRound1 || !isConnected}
                  className={`w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                    candidates.length >= 2 && isConnected && !isStartingRound1
                      ? 'btn-gold-senior cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  {isStartingRound1 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Iniciando Votación...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>
                        {candidates.length >= 2 
                          ? `Abrir Votación de 1ª Vuelta (${candidates.length} Candidatos)` 
                          : 'Selecciona al menos 2 Candidatos'}
                      </span>
                    </>
                  )}
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

          {/* Courses & Individual Candidates Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cursos Elegibles & Selección Individual de Candidatos */}
            <div className="card-senior rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Cursos y Candidatos a Coordinador General</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Marca qué cursos son candidatos y elige específicamente qué hermanos participan.
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  {candidates.length} activos
                </span>
              </div>

              {status !== 'CONFIG' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Elección en curso. Para cambiar candidatos debes reiniciar la asamblea.</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                {ALL_COURSES.map(course => {
                  const isChecked = eligibleCourses.includes(course);
                  const courseSeminaristas = seminaristas.filter(s => s.curso === course);
                  const activeCourseCandidates = courseSeminaristas.filter(s => selectedCandidateIds.includes(s.id));

                  return (
                    <div
                      key={course}
                      className={`rounded-xl border transition-all ${
                        isChecked 
                          ? 'bg-amber-500/[0.07] border-amber-500/40 shadow-sm' 
                          : 'bg-[#040714] border-white/[0.06]'
                      }`}
                    >
                      {/* Course Header Toggle */}
                      <div
                        onClick={() => status === 'CONFIG' && handleToggleEligibleCourse(course)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer ${
                          isChecked ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isChecked ? 'text-amber-400' : 'text-slate-700'}`} />
                          <span className="text-xs font-serif font-bold">{course}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            ({courseSeminaristas.length} seminaristas)
                          </span>
                        </div>

                        {isChecked && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {activeCourseCandidates.length} de {courseSeminaristas.length} candidatos
                          </span>
                        )}
                      </div>

                      {/* Expandable Individual Seminaristas Selector */}
                      {isChecked && courseSeminaristas.length > 0 && (
                        <div className="px-3 pb-3 pt-1 border-t border-amber-500/20 space-y-2 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] text-amber-300/90 font-medium">
                            <span>¿Quiénes participan de este curso?</span>
                            {status === 'CONFIG' && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleSelectAllInCourse(course, true); }}
                                  className="text-[10px] font-bold text-amber-400 hover:underline"
                                >
                                  Marcar Todos
                                </button>
                                <span className="text-slate-600">•</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleSelectAllInCourse(course, false); }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-white hover:underline"
                                >
                                  Desmarcar Todos
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {courseSeminaristas.map(sem => {
                              const isCand = selectedCandidateIds.includes(sem.id);
                              return (
                                <button
                                  key={sem.id}
                                  type="button"
                                  disabled={status !== 'CONFIG'}
                                  onClick={(e) => { e.stopPropagation(); handleToggleCandidate(sem.id); }}
                                  className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                                    isCand
                                      ? 'bg-amber-400/15 border-amber-400/50 text-white shadow-sm'
                                      : 'bg-black/40 border-white/[0.04] text-slate-500 hover:text-slate-300 hover:border-white/[0.1]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-[9px] font-bold border ${
                                      isCand 
                                        ? 'bg-amber-500/30 border-amber-400 text-amber-300' 
                                        : 'bg-slate-900 border-white/[0.1] text-slate-500'
                                    }`}>
                                      {sem.nombre.charAt(0)}
                                    </div>
                                    <span className="truncate font-serif text-xs font-bold">{sem.nombre}</span>
                                  </div>

                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    isCand
                                      ? 'bg-amber-400/20 text-amber-300'
                                      : 'bg-white/[0.02] text-slate-600'
                                  }`}>
                                    {isCand ? '✓ Participa' : 'Excluido'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
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
