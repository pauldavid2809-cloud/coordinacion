import React, { useState, useMemo } from 'react';
import { User, ShieldCheck, KeyRound, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authenticateSeminarista, authenticateRector } from '../../services/authService';
import { extractCedulaDigits, matchCedula } from '../../utils/formatters';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, seminaristas = [] }) {
  const [activeTab, setActiveTab] = useState('seminarista'); // 'seminarista' | 'rector'
  const [cedulaInput, setCedulaInput] = useState('');
  const [claveInput, setClaveInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Detección previa del seminarista conforme escribe
  const matchedSeminarista = useMemo(() => {
    const digits = extractCedulaDigits(cedulaInput);
    if (!digits || digits.length < 6) return null;
    return seminaristas.find(s => matchCedula(s.cedula, digits));
  }, [cedulaInput, seminaristas]);

  if (!isOpen) return null;

  const handleSeminaristaSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = authenticateSeminarista(cedulaInput, seminaristas);
    setLoading(false);

    if (result.success) {
      onLoginSuccess({ role: 'seminarista', user: result.user });
      onClose();
    } else {
      setError(result.error);
    }
  };

  const handleRectorSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = authenticateRector(claveInput);
    setLoading(false);

    if (result.success) {
      onLoginSuccess({ role: 'rector', user: result.user });
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-modalIn">
        
        {/* Cabecera del modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 text-white text-center relative border-b border-amber-500/20">
          <div className="h-20 w-auto mx-auto flex items-center justify-center mb-3">
            <img 
              src="/logo.png" 
              alt="Escudo Seminario Santo Tomás de Aquino - Sacerdos Lux" 
              className="h-full w-auto object-contain filter drop-shadow-md"
            />
          </div>
          <h2 className="text-xl font-serif font-bold text-amber-100">
            {activeTab === 'seminarista' ? 'Portal del Seminarista' : 'Acceso de Rectoría'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Seminario Mayor Santo Tomás de Aquino
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => { setActiveTab('seminarista'); setError(''); }}
            className={`flex-1 py-3.5 text-xs font-bold btn-tactile flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'seminarista'
                ? 'border-amber-600 text-amber-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Soy Seminarista</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('rector'); setError(''); }}
            className={`flex-1 py-3.5 text-xs font-bold btn-tactile flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'rector'
                ? 'border-slate-800 text-slate-900 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Equipo Formador</span>
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-slideDown">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'seminarista' ? (
            <form onSubmit={handleSeminaristaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Cédula
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cedulaInput}
                    onChange={(e) => setCedulaInput(e.target.value)}
                    placeholder="Ej. 30.413.000 o 30413000"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 font-medium text-base sm:text-sm transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ingresa tu cédula sin importar si lleva puntos o guion.
                </p>
              </div>

              {/* Reconocimiento automático si coincide */}
              {matchedSeminarista && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-slideDown">
                  <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">{matchedSeminarista.nombreCompleto || matchedSeminarista.nombre}</span>
                    <p className="text-[11px] text-amber-700">{matchedSeminarista.curso} • {matchedSeminarista.diocesis}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !cedulaInput.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg btn-tactile flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                <span>Entrar al Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRectorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clave Maestra de Rectoría
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={claveInput}
                    onChange={(e) => setClaveInput(e.target.value)}
                    placeholder="Ingresa la clave maestra"
                    autoFocus
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 font-medium text-base sm:text-sm transition-[border-color,box-shadow] duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 btn-tactile p-1 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Acceso exclusivo para formadores y rectores autorizados.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !claveInput.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold text-sm shadow-md hover:shadow-lg btn-tactile flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Acceder a Rectoría</span>
              </button>
            </form>
          )}

          {/* Botón para cerrar modal si ya hay sesión */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 btn-tactile px-3 py-1.5 rounded-lg"
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
