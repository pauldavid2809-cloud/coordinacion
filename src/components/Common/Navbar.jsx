import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, Church, ChevronDown, Bell, CheckCircle2, X } from 'lucide-react';

export default function Navbar({ session, onLogout, onOpenLogin }) {
  const isRector = session?.role === 'rector';
  const isSeminarista = session?.role === 'seminarista';
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  // Extraer el primer nombre para mostrar de forma limpia en pantallas pequeñas
  const primerNombre = session?.user?.nombre ? session.user.nombre.split(' ')[0] : 'Usuario';
  const inicial = session?.user?.nombre?.charAt(0) || (isRector ? 'R' : 'U');

  return (
    <>
      <header className="bg-slate-900/98 text-white border-b border-amber-500/30 sticky top-0 z-40 shadow-lg backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* Logo & Institución */}
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 flex-1">
              <div className="h-10 sm:h-14 w-auto flex items-center justify-center flex-shrink-0 py-0.5">
                <img 
                  src="/logo.png" 
                  alt="Escudo Seminario Santo Tomás de Aquino - Sacerdos Lux" 
                  className="h-full w-auto object-contain filter drop-shadow-md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-xs sm:text-base tracking-wider text-amber-100 truncate block">
                    <span className="sm:hidden">Seminario Santo Tomás</span>
                    <span className="hidden sm:inline">Seminario Santo Tomás de Aquino</span>
                  </span>
                  <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                    2026-2027
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 font-light truncate">
                  <span className="md:hidden">Arquidiócesis de Maracaibo</span>
                  <span className="hidden md:inline">Arquidiócesis de Maracaibo • Gestión de Solicitudes y Permisos</span>
                </p>
              </div>
            </div>

            {/* Estado de Sesión y Acciones */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {session ? (
                <div className="flex items-center space-x-2">
                  
                  {/* Vista Rector */}
                  {isRector && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-semibold min-h-[44px]">
                      <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="hidden sm:inline">Rectoría / Formadores</span>
                      <span className="sm:hidden font-bold">Rectoría</span>
                    </div>
                  )}

                  {/* Vista Seminarista: Pastilla interactiva en móvil y desktop */}
                  {isSeminarista && (
                    <button
                      onClick={() => setShowMobileProfile(true)}
                      className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/50 btn-tactile min-h-[44px] text-left"
                      title="Ver ficha de usuario"
                      aria-label="Ver ficha del seminarista"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-300 font-serif font-bold text-xs flex items-center justify-center border border-amber-400/40 flex-shrink-0">
                        {inicial}
                      </div>
                      <div className="hidden sm:flex flex-col text-left leading-tight">
                        <span className="text-xs font-bold text-slate-100 max-w-[130px] truncate">
                          {session.user?.nombre}
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-medium truncate">
                          {session.user?.curso}
                        </span>
                      </div>
                      <div className="sm:hidden flex items-center text-xs font-bold text-slate-200 pr-1">
                        <span className="max-w-[75px] truncate">{primerNombre}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                      </div>
                    </button>
                  )}

                  {/* Botón Salir con target táctil mínimo de 44x44px */}
                  <button
                    onClick={onLogout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                    className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-rose-950/80 text-rose-300 hover:text-rose-100 border border-slate-700 hover:border-rose-600/50 btn-tactile text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Salir</span>
                  </button>

                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md btn-tactile"
                >
                  <User className="w-4 h-4" />
                  <span>Ingresar</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Modal / Hoja de Perfil Móvil del Seminarista */}
      {showMobileProfile && isSeminarista && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-modalIn max-h-[85vh] flex flex-col">
            
            {/* Cabecera de la ficha */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 font-serif font-bold text-xl flex items-center justify-center border border-amber-400/40">
                  {inicial}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-amber-100 leading-tight">
                    {session.user?.nombreCompleto || session.user?.nombre}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cédula: <span className="font-mono font-bold text-amber-300">{session.user?.cedula}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileProfile(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl btn-tactile min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Cerrar ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detalles */}
            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Etapa y Diócesis
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {session.user?.curso}
                </p>
                <p className="text-slate-600">
                  Diócesis de {session.user?.diocesis}
                </p>
              </div>

              {session.user?.telefono && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                    Teléfono Registrado
                  </span>
                  <p className="font-mono font-bold text-slate-800">
                    {session.user?.telefono}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowMobileProfile(false);
                    onLogout();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center justify-center gap-2 btn-tactile min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
