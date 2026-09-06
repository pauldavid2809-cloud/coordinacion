import React, { useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { GuiaVotacionVideo } from '../remotion/GuiaVotacionVideo';
import { Play, Pause, RotateCcw, ArrowLeft, Smartphone, ShieldCheck, Tv, KeyRound, Sparkles } from 'lucide-react';

export default function VideoPlayerView({ onBack }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const seekToScene = (frameNumber) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frameNumber);
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isPlaying()) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartVideo = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
      {/* Navigation Top Bar */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Portal</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Remotion Engine • 40s (1080×1920) WhatsApp</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left / Center Column: The Remotion Player with Phone frame */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[390px] rounded-[38px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-4 border-slate-700/60">
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Video Canvas Container */}
            <div className="w-full rounded-[28px] overflow-hidden bg-black aspect-[9/16] relative shadow-inner">
              <Player
                ref={playerRef}
                component={GuiaVotacionVideo}
                durationInFrames={1200}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                controls
                loop
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          </div>

          {/* Quick Playback bar under phone */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>
            <button
              onClick={restartVideo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* Right Column: Scene Timeline Navigator & Key Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white gold-heading mb-2">
              Guía Audiovisual Oficial de Votación
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Video tutorial interactivo en formato vertical (9:16), creado para difundir por WhatsApp a los 38 seminaristas votantes y proyectar las reglas del proceso.
            </p>
          </div>

          {/* Scene selector jump buttons */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400/80">
              Saltar a Escena del Video:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => seekToScene(0)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:00 • Escena 1</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Portada y Bienvenida</div>
                <div className="text-xs text-slate-400">Escudo oficial y título solemne</div>
              </button>

              <button
                onClick={() => seekToScene(150)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:05 • Escena 2</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Acceso Universal Móvil</div>
                <div className="text-xs text-slate-400">Sin instalar apps, vía navegador</div>
              </button>

              <button
                onClick={() => seekToScene(360)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:12 • Escena 3</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Búsqueda y Clave Maestra</div>
                <div className="text-xs text-slate-400">Sin tildes y Bypass 28092002</div>
              </button>

              <button
                onClick={() => seekToScene(570)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:19 • Escena 4</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Votación y Reglas</div>
                <div className="text-xs text-slate-400">Voto secreto + 1ª y 2ª vuelta</div>
              </button>

              <button
                onClick={() => seekToScene(810)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:27 • Escena 5</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Pantalla TV y Oficios</div>
                <div className="text-xs text-slate-400">Telemetría y 4 coordinaciones</div>
              </button>

              <button
                onClick={() => seekToScene(1050)}
                className="text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="text-xs font-mono text-amber-400 font-semibold mb-0.5">00:35 • Escena 6</div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">Cierre Solemne</div>
                <div className="text-xs text-slate-400">Cita bíblica (Mc 9, 35)</div>
              </button>
            </div>
          </div>

          {/* Highlights Info Cards */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
              <KeyRound className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">Clave Maestra para Emergencias</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Si un seminarista olvidó su cédula o no aparece registrada, puede ingresar con la clave maestra <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">28092002</span>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-3.5">
              <Tv className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-sky-300">Transmisión en Salón Principal</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  La vista de TV refleja el quórum en vivo conforme votan los 38 electores y proclama al Coordinador General con mayoría calificada (75%).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
