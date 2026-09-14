import React from 'react';
import { ShieldCheck, User, LogOut, Church } from 'lucide-react';

export default function Navbar({ session, onLogout, onOpenLogin }) {
  const isRector = session?.role === 'rector';
  const isSeminarista = session?.role === 'seminarista';

  return (
    <header className="bg-slate-900 text-white border-b border-amber-500/30 sticky top-0 z-40 shadow-lg backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Institución */}
          <div className="flex items-center space-x-3">
            <div className="h-11 sm:h-14 w-auto flex items-center justify-center flex-shrink-0 py-0.5">
              <img 
                src="/logo.png" 
                alt="Escudo Seminario Santo Tomás de Aquino - Sacerdos Lux" 
                className="h-full w-auto object-contain filter drop-shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base tracking-wide text-amber-100">
                  Seminario Santo Tomás de Aquino
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  2026-2027
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-light">
                Arquidiócesis de Maracaibo • Gestión de Solicitudes y Permisos
              </p>
            </div>
          </div>

          {/* Estado de Sesión y Acciones */}
          <div className="flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-3">
                {isRector ? (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Rectoría / Formadores</span>
                  </div>
                ) : (
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-100 line-clamp-1">
                      {session.user?.nombre}
                    </span>
                    <span className="text-[11px] text-amber-300/90 font-medium">
                      {session.user?.curso}
                    </span>
                  </div>
                )}

                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 btn-tactile text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md btn-tactile"
              >
                <User className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
