import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from './utils/socket';
import HeaderBanner from './components/HeaderBanner';
import TVView from './components/TVView';
import TabletAdmin from './components/TabletAdmin';
import VoterMobile from './components/VoterMobile';
import { Tv, Tablet, Smartphone, Sparkles, ExternalLink, Wifi, Shield } from 'lucide-react';

export default function App() {
  const [electionState, setElectionState] = useState(null);
  const [seminaristas, setSeminaristas] = useState([]);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetch('/api/seminaristas')
      .then(res => res.json())
      .then(data => setSeminaristas(data))
      .catch(err => console.error('Error fetching seminaristas:', err));

    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => setNetworkInfo(data))
      .catch(err => console.error('Error fetching network info:', err));

    socket.on('election:state', (newState) => {
      setElectionState(newState);
    });

    return () => {
      socket.off('election:state');
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isTV = currentPath === '/tv';
  const isAdmin = currentPath === '/admin' || currentPath === '/padre';
  const isVoter = currentPath === '/votar';

  const isLockedScreen = isTV || isAdmin;

  return (
    <div className={`${isLockedScreen ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'} flex flex-col bg-[#040714] text-slate-100 selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden`}>
      {/* Top Banner - Omitted on TV and Admin for dedicated fullscreen ergonomics */}
      {!isLockedScreen && (
        <HeaderBanner 
          role={isVoter ? 'voter' : 'portal'} 
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
              />
            </motion.div>
          )}

          {/* Portal Home */}
          {!isTV && !isAdmin && !isVoter && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="max-w-5xl mx-auto p-4 sm:p-10 my-auto text-center space-y-10"
            >
              {/* Sacred Crest & Title */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse"></div>
                  <img 
                    src="/logo.svg" 
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* TV */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => navigateTo('/tv')}
                  className="card-senior group p-7 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-amber-500/30"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Tv className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
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
                  className="card-senior group p-7 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-sky-500/30"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/40 text-sky-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Tablet className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-sky-300 transition-colors">
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
                  className="card-senior group p-7 rounded-3xl text-center space-y-4 cursor-pointer shadow-2xl border-emerald-500/30"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
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
