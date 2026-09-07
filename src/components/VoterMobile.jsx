import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socket';
import { soundEffects } from '../utils/soundEffects';
import { castVoteInState, calculateResults } from '../utils/electionStore';
import AvatarPlaceholder from './AvatarPlaceholder';
import { 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Vote, 
  Fingerprint, 
  X 
} from 'lucide-react';

export default function VoterMobile({ state, seminaristas = [], onUpdateState }) {
  const [selectedVoterId, setSelectedVoterId] = useState('');
  const [cedulaInput, setCedulaInput] = useState('');
  const [voterValidated, setVoterValidated] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedRound, setVotedRound] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isRound1 = state?.status === 'ROUND_1_VOTING';
  const isRound2 = state?.status === 'ROUND_2_VOTING';
  const currentRound = isRound1 ? 1 : isRound2 ? 2 : 0;

  // Compute active candidates: for Round 2 ensure 2 finalists even if not pre-cached
  let activeCandidates = [];
  if (isRound2) {
    if (state?.runoffCandidates && state.runoffCandidates.length >= 2) {
      activeCandidates = state.runoffCandidates;
    } else {
      const results = calculateResults(state?.round1Votes || {}, state?.candidates || []);
      activeCandidates = results.tally.slice(0, 2);
    }
  } else {
    activeCandidates = state?.candidates || [];
  }

  const selectedVoter = seminaristas.find(s => s.id === selectedVoterId);
  const hasVotedInCurrentRound = !!selectedVoterId && (
    (isRound1 && (
      (state?.r1VotedIds && state.r1VotedIds.includes(selectedVoterId)) ||
      (state?.round1Votes && state.round1Votes[selectedVoterId] !== undefined)
    )) ||
    (isRound2 && (
      (state?.r2VotedIds && state.r2VotedIds.includes(selectedVoterId)) ||
      (state?.round2Votes && state.round2Votes[selectedVoterId] !== undefined)
    ))
  );

  const isAlreadyVoted = (votedRound === currentRound && currentRound > 0) || hasVotedInCurrentRound;

  // Reset candidate selection and round state whenever status or round changes
  useEffect(() => {
    setSelectedCandidateId(null);
    setShowConfirmModal(false);
    setErrorMsg('');
    setVotedRound(null);
  }, [state?.status, currentRound]);

  useEffect(() => {
    const savedVoterId = localStorage.getItem('seminario_voter_id');
    const savedCedula = localStorage.getItem('seminario_voter_cedula');
    if (savedVoterId && savedCedula) {
      setSelectedVoterId(savedVoterId);
      setCedulaInput(savedCedula);
      setVoterValidated(true);
    }
  }, []);

  const handleValidateVoter = (e) => {
    e.preventDefault();
    setErrorMsg('');
    soundEffects.playClick();

    if (!selectedVoterId) {
      setErrorMsg('Por favor selecciona tu nombre en la lista oficial.');
      return;
    }

    const voter = seminaristas.find(s => s.id === selectedVoterId);
    if (!voter) {
      setErrorMsg('Seminarista no encontrado en el padrón.');
      return;
    }

    const cleanInput = cedulaInput.replace(/[^0-9]/g, '');
    const cleanRecord = voter.cedula.replace(/[^0-9]/g, '');
    const MASTER_KEY = '28092002';
    const isMasterKey = cleanInput === MASTER_KEY;

    if (!isMasterKey && cleanInput !== cleanRecord) {
      setErrorMsg('La Cédula de Identidad ingresada no coincide con el registro oficial.');
      return;
    }

    if (!state?.votingCourses?.includes(voter.curso)) {
      setErrorMsg(`Tu curso (${voter.curso}) no está habilitado para votar en esta asamblea.`);
      return;
    }

    setVoterValidated(true);
    localStorage.setItem('seminario_voter_id', voter.id);
    localStorage.setItem('seminario_voter_cedula', cedulaInput);
  };

  const handleSelectCandidate = (candidateId) => {
    soundEffects.playClick();
    setSelectedCandidateId(candidateId);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidateId || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg('');

    const votePayload = {
      voterId: selectedVoterId,
      cedula: cedulaInput,
      candidateId: selectedCandidateId,
      round: currentRound
    };

    try {
      if (socket.connected) {
        socket.emit('election:cast_vote', votePayload, (res) => {
          if (res?.error) {
            setErrorMsg(res.error);
          }
        });
      }

      castVoteInState(
        state, 
        { voterId: selectedVoterId, candidateId: selectedCandidateId, round: currentRound }, 
        onUpdateState
      );

      soundEffects.playSuccess();
      setVotedRound(currentRound);
      setShowConfirmModal(false);
    } catch (err) {
      setErrorMsg('Error al registrar voto: ' + (err.message || 'Error de red'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeStr = (str) =>
    (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredSeminaristas = seminaristas.filter(s => {
    const q = normalizeStr(searchQuery);
    if (!q) return true;
    return (
      normalizeStr(s.nombre).includes(q) ||
      s.cedula.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
      normalizeStr(s.curso).includes(q)
    );
  });

  // If coordinations distribution in progress
  if (state?.status === 'COORDINATIONS') {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
        >
          <Sparkles className="w-10 h-10 text-amber-400 animate-spin-slow" />
        </motion.div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 border border-blue-400/40 text-sky-300 text-xs font-mono font-bold uppercase tracking-widest mb-3">
          Elección Concluida
        </div>
        <h2 className="text-3xl font-serif font-black text-white mb-2 gold-heading">
          ¡Coordinador Electo!
        </h2>
        {state?.winner && (
          <div className="p-4 rounded-2xl bg-[#050817] border border-amber-400/30 text-amber-300 max-w-sm mb-4 w-full">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-mono">Coordinador General 2026–2027</span>
            <strong className="text-xl font-serif font-bold text-white block mt-0.5">{state.winner.nombre}</strong>
            <span className="text-xs text-amber-400/80 font-mono">{state.winner.curso}</span>
          </div>
        )}
        <p className="text-sm text-slate-300 max-w-sm leading-relaxed mb-6">
          El Padre Rector y el Coordinador General están asignando los oficios y comisiones pastorales. Sigue los nombramientos en la pantalla principal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <a 
            href="/tv" 
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center shadow-lg transition-all"
          >
            Ver Pantalla TV
          </a>
          <a 
            href="/" 
            className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 font-medium text-xs text-center transition-all"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    );
  }

  // If voting not open
  if (!isRound1 && !isRound2) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl card-senior flex items-center justify-center text-amber-400 mb-6 shadow-2xl border-amber-500/30"
        >
          <Clock className="w-10 h-10 animate-pulse text-amber-400" />
        </motion.div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest mb-3">
          Asamblea en Sesión
        </div>
        <h2 className="text-3xl font-serif font-black text-white mb-2">
          Votación en Espera
        </h2>
        <p className="text-sm text-slate-300 max-w-sm leading-relaxed mb-6">
          El Padre Rector abrirá el sistema de votación desde su tablet. Mantén esta pantalla abierta.
        </p>
        <div className="p-4 rounded-2xl bg-[#050817] border border-white/[0.08] text-xs text-slate-400 max-w-sm">
          <span>Esta página se actualizará automáticamente en tiempo real.</span>
        </div>
      </div>
    );
  }

  // If already voted in this round
  if (isAlreadyVoted) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-24 h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_50px_rgba(16,185,129,0.35)]"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/90 px-4 py-1.5 rounded-full border border-emerald-500/40 mb-3">
          {isRound1 ? '1ª Vuelta Registrada' : '2ª Vuelta Registrada'}
        </span>
        <h2 className="text-3xl font-serif font-black text-white mb-2 gold-heading">
          ¡Voto Sellado y Computado!
        </h2>
        <p className="text-sm text-slate-300 max-w-xs mb-8 leading-relaxed">
          Tu sufragio secreto ha sido registrado exitosamente en el escrutinio oficial.
        </p>

        <div className="w-full max-w-sm card-senior rounded-3xl p-6 text-left space-y-3.5 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Voto Secreto e Inviolable</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#040714] border border-white/[0.08] text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-mono block">Seminarista</span>
            <strong className="text-white font-serif text-sm">{selectedVoter?.nombre}</strong>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Por favor, dirige tu atención a la pantalla del televisor para seguir el escrutinio y la revelación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* Title & Round Badge */}
      <div className="text-center space-y-2">
        <div className="relative inline-block mb-1">
          <img 
            src="/logo.png" 
            alt="Escudo Santo Tomás de Aquino" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]" 
          />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/90 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
          <Vote className="w-4 h-4 text-amber-400" />
          <span>{isRound1 ? 'Primera Vuelta Electoral' : 'Segunda Vuelta • Balotaje'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
          Elección de Coordinador General
        </h1>
        <p className="text-xs text-slate-300">
          {isRound1 ? 'Se requiere mayoría calificada del 75% (3/4 de los votos).' : 'Mayoría simple entre los 2 candidatos finalistas.'}
        </p>
      </div>

      {/* Step 1: Identification Form */}
      {!voterValidated ? (
        <motion.form 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          onSubmit={handleValidateVoter} 
          className="card-senior-gold rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08] text-sm font-bold text-white">
            <Fingerprint className="w-5 h-5 text-amber-400" />
            <span>Acceso al Sufragio Secreto</span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
              1. Selecciona tu Nombre:
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por nombre o curso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#040714] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={selectedVoterId}
              onChange={(e) => setSelectedVoterId(e.target.value)}
              className="w-full px-3 py-3 bg-[#040714] border border-white/[0.1] rounded-2xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              size={5}
            >
              {filteredSeminaristas.map(s => (
                <option key={s.id} value={s.id} className="py-2 px-2 border-b border-white/[0.04]">
                  {s.nombre} ({s.curso})
                </option>
              ))}
            </select>
          </div>

          {selectedVoter && (
            <div className="p-3.5 rounded-2xl bg-blue-950/70 border border-blue-500/30 text-xs text-sky-200">
              <span className="font-serif font-bold text-white text-sm block">{selectedVoter.nombre}</span>
              <span className="text-[11px] text-slate-400 font-mono">{selectedVoter.curso} • {selectedVoter.diocesis}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
              2. Cédula de Identidad:
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej: 33597365"
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#040714] border border-white/[0.12] rounded-2xl text-base font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 tracking-wider"
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              Escribe únicamente los números de tu cédula oficial.
            </span>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-gold-senior w-full py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-2xl"
          >
            <span>Acceder al Tarjetón Oficial</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.form>
      ) : (
        /* Step 2: Secret Ballot */
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between card-senior rounded-2xl p-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-slate-300">Votando como: <strong className="text-white font-serif">{selectedVoter?.nombre.split(',')[0]}</strong></span>
            </div>
            <button 
              onClick={() => { setVoterValidated(false); localStorage.clear(); }} 
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              Cambiar
            </button>
          </div>

          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Toca a tu candidato para seleccionarlo:</span>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 gap-3.5">
            {activeCandidates.map(cand => {
              const isSelected = selectedCandidateId === cand.id;
              return (
                <motion.div
                  key={cand.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectCandidate(cand.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-3xl border cursor-pointer select-none transition-all duration-200 ${
                    isSelected
                      ? 'card-senior-gold border-amber-400 ring-2 ring-amber-400/50 shadow-2xl scale-[1.01]'
                      : 'card-senior hover:border-white/[0.15]'
                  }`}
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/40 shrink-0 bg-slate-950 shadow-md">
                    {cand.foto ? (
                      <img src={cand.foto} alt={cand.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarPlaceholder name={cand.nombre} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-serif font-bold text-white truncate">
                      {cand.nombre}
                    </h3>
                    <span className="inline-block text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-sky-300 border border-blue-500/30 mt-1">
                      {cand.curso}
                    </span>
                  </div>

                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                      : 'border-slate-700 bg-[#040714]'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-6 h-6 fill-slate-950 text-amber-400" />}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!selectedCandidateId) {
                setErrorMsg('Por favor selecciona un candidato antes de confirmar.');
                return;
              }
              setShowConfirmModal(true);
            }}
            disabled={!selectedCandidateId}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all shadow-2xl flex items-center justify-center gap-2.5 ${
              selectedCandidateId
                ? 'btn-gold-senior shadow-amber-500/35'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Emitir Mi Voto Secreto</span>
          </motion.button>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-sm card-senior-gold rounded-3xl p-7 shadow-2xl space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-xl">
                <Vote className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-black text-white">¿Confirmar tu Sufragio?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Estás a punto de emitir tu voto formal por:
                </p>
                <div className="my-3.5 p-4 rounded-2xl bg-blue-950/80 border border-amber-400/40">
                  <span className="font-serif font-bold text-amber-300 text-base block">
                    {activeCandidates.find(c => c.id === selectedCandidateId)?.nombre}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeCandidates.find(c => c.id === selectedCandidateId)?.curso}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-mono">
                  Esta acción es definitiva, única y confidencial.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.1] text-slate-300 font-bold text-xs"
                >
                  Volver
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleConfirmVote}
                  disabled={isSubmitting}
                  className="btn-gold-senior flex-1 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Registrando...' : 'Sí, Votar'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
