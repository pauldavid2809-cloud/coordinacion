import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from './utils/socket';
import { db, ref, onValue, set } from './utils/firebase';
import defaultSeminaristas from '../server/data/seminaristas.json';
import defaultState from '../server/data/state.json';
import HeaderBanner from './components/HeaderBanner';
import TVView from './components/TVView';
import TabletAdmin from './components/TabletAdmin';
import VoterMobile from './components/VoterMobile';
import VideoPlayerView from './components/VideoPlayerView';
import { Tv, Tablet, Smartphone, Sparkles, ExternalLink, Wifi, Shield, Film } from 'lucide-react';

export default function App() {
  const [electionState, setElectionState] = useState(() => {
    try {
      const saved = localStorage.getItem('coordinacion_election_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultState;
  });
  const [seminaristas, setSeminaristas] = useState(defaultSeminaristas);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Cross-tab and local storage real-time synchronization
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'coordinacion_election_state' && e.newValue) {
        try {
          setElectionState(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc = null;
    try {
      bc = new BroadcastChannel('coordinacion_election');
      bc.onmessage = (event) => {
        if (event.data) {
          setElectionState(event.data);
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // 1. Fetch seminaristas safely
    fetch('/api/seminaristas')
      .then(res => {
        if (!res.ok) throw new Error('API response not OK');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setSeminaristas(data);
      })
      .catch(() => {
        // Fallback to defaultSeminaristas already loaded
      });

    // 2. Fetch network info safely
    fetch('/api/network-info')
      .then(res => {
        if (!res.ok) throw new Error('Network info not OK');
        return res.json();
      })
      .then(data => setNetworkInfo(data))
      .catch(() => {});

    // 3. Fetch state via REST fallback safely
    fetch('/api/state')
      .then(res => {
        if (!res.ok) throw new Error('State response not OK');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then(data => {
        if (data && !data.error && data.status) setElectionState(data);
      })
      .catch(() => {});

    // 4. Firebase Realtime Database live cross-device sync (Single Source of Truth on Vercel)
    let unsubscribeFirebase = null;
    try {
      const stateRef = ref(db, 'election/state');
      unsubscribeFirebase = onValue(stateRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.status) {
          const r1Votes = data.round1Votes || {};
          const r2Votes = data.round2Votes || {};
          const r1VotedIds = Object.keys(r1Votes);
          const r2VotedIds = Object.keys(r2Votes);

          setElectionState(prev => ({
            ...prev,
            ...data,
            round1Votes: r1Votes,
            round2Votes: r2Votes,
            r1VoteCount: r1VotedIds.length,
            r2VoteCount: r2VotedIds.length,
            r1VotedIds,
            r2VotedIds,
            selectedCandidateIds: data.selectedCandidateIds || (data.candidates || []).map(c => c.id),
            coordinations: data.coordinations || prev.coordinations,
            coordinators: data.coordinators || prev.coordinators,
            subgroups: data.subgroups || prev.subgroups,
            memberSubgroups: data.memberSubgroups || prev.memberSubgroups
          }));
        } else if (data === null) {
          // Initialize Firebase with default state on first run
          set(stateRef, defaultState).catch(() => {});
        }
      }, (err) => {
        console.warn('Firebase onValue error:', err);
      });
    } catch (err) {
      console.warn('Firebase setup error:', err);
    }

    // 5. WebSocket handlers (for local network high-speed sync)
    const handleState = (newState) => {
      setElectionState(newState);
    };

    socket.on('election:state', handleState);
    socket.on('connect', () => {
      socket.emit('election:get_state');
    });

    if (socket.connected) {
      socket.emit('election:get_state');
    }

    return () => {
      socket.off('election:state', handleState);
      socket.off('connect');
      if (typeof unsubscribeFirebase === 'function') {
        unsubscribeFirebase();
      }
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isTV = currentPath === '/tv';
  const isAdmin = currentPath === '/admin' || currentPath === '/padre';
  const isVoter = currentPath === '/votar';
  const isVideo = currentPath === '/video';

  const isLockedScreen = isTV || isAdmin;

  return (
    <div className={`${isLockedScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} flex flex-col bg-[#040714] text-slate-100 selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden`}>
      {/* Top Banner - Omitted on TV and Admin for dedicated fullscreen ergonomics */}
      {!isLockedScreen && (
        <HeaderBanner 
          role={isVoter ? 'voter' : isVideo ? 'video' : 'portal'} 
          status={electionState?.status || 'CONFIG'} 
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative z-10 ${isLockedScreen ? 'min-h-0 overflow-hidden' : ''}`}>
        <AnimatePresence mode="wait">
          {isTV && (
            <motion.div
              key="tv"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col min-h-0 h-full overflow-hidden"
            >
              <TVView 
                state={electionState} 
                seminaristas={seminaristas} 
                networkInfo={networkInfo} 
                onUpdateState={setElectionState}
              />
            </motion.div>
          )}

          {isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col min-h-0 h-full overflow-hidden"
            >
              <TabletAdmin 
                state={electionState} 
                seminaristas={seminaristas} 
                networkInfo={networkInfo} 
                onUpdateState={setElectionState}
              />
            </motion.div>
          )}

          {isVoter && (
            <motion.div
              key="voter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <VoterMobile 
                state={electionState} 
                seminaristas={seminaristas} 
                onUpdateState={setElectionState}
              />
            </motion.div>
          )}

          {isVideo && (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <VideoPlayerView onBack={() => navigateTo('/')} />
            </motion.div>
          )}

          {/* Portal Home */}
          {!isTV && !isAdmin && !isVoter && !isVideo && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="max-w-6xl mx-auto p-4 sm:p-10 my-auto text-center space-y-10"
            >
              {/* Sacred Crest & Title */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse"></div>
                  <img 
                    src="/logo.png" 
                    alt="Escudo del Seminario" 
                    className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto object-contain drop-shadow-[0_0_35px_rgba(251,191,36,0.5)]" 
                  />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Curso Formativo 2026–2027</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-serif font-black text-white tracking-tight gold-heading">
                  Seminario Mayor Santo Tomás de Aquino
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                  Sistema de Transmisión Electoral y Tablero Pastoral de Coordinaciones en Tiempo Real.
                </p>
              </div>

              {/* Roles Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
                {/* TV */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => navigateTo('/tv')}
                  className="card-senior group p-6 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-amber-500/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Tv className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                      Pantalla Televisor
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Arena de transmisión para el salón: medidor de votos en vivo, modo suspenso y tablero pastoral.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono font-bold text-amber-400 inline-flex items-center gap-1.5">
                    <span>Abrir Pantalla</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>

                {/* Tablet Padre */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => navigateTo('/admin')}
                  className="card-senior group p-6 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-sky-500/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/40 text-sky-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Tablet className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-sky-300 transition-colors">
                      Tablet del Padre Rector
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Centro de mando: sube fotos, abre/cierra votaciones y asigna a los seminaristas en tiempo real.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono font-bold text-sky-400 inline-flex items-center gap-1.5">
                    <span>Abrir Consola</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>

                {/* Mobile Voter */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => navigateTo('/votar')}
                  className="card-senior group p-6 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-emerald-500/30"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                      Móvil Seminarista
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Tarjetón secreto para los hermanos votantes: validación por Cédula de Identidad oficial.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono font-bold text-emerald-400 inline-flex items-center gap-1.5">
                    <span>Ir a Votar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>

                {/* WhatsApp Video Guide */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => navigateTo('/video')}
                  className="card-senior group p-6 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-purple-500/30 bg-purple-950/10"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/40 text-purple-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Film className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                      Guía en Video
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Animación 9:16 para WhatsApp: paso a paso para votar, búsqueda sin tildes y pantalla TV.
                    </p>
                  </div>
                  <div className="pt-2 text-xs font-mono font-bold text-purple-400 inline-flex items-center gap-1.5">
                    <span>Ver Video</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </div>

              {/* Network IP pill */}
              {networkInfo && (
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#050817] border border-white/[0.08] text-xs text-slate-300 font-mono shadow-md">
                  <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Enlace de red local para enviar: <strong className="text-amber-300">{networkInfo.voteUrl}</strong></span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isLockedScreen && (
        <footer className="w-full py-4 px-6 border-t border-white/[0.06] text-center text-xs text-slate-500 font-mono">
          Arquidiócesis de Maracaibo • Seminario Mayor Santo Tomás de Aquino • Sacerdos Lux
        </footer>
      )}
    </div>
  );
}
