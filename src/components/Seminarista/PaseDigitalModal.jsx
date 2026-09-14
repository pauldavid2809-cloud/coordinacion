import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  User, 
  Church, 
  Send, 
  Phone, 
  ChevronDown, 
  ChevronUp,
  MessageCircle
} from 'lucide-react';
import { formatDateTime, formatJurisdiccion } from '../../utils/formatters.js';
import { generatePermisoWhatsAppText, shareViaWhatsApp } from '../../utils/whatsappShare.js';
import { FORMADORES_SEMINARIO } from '../../data/formadores.js';

export default function PaseDigitalModal({ isOpen, onClose, permiso, seminarista }) {
  if (!isOpen || !permiso) return null;

  const isAprobado = (permiso.estado || '').toLowerCase() === 'aprobado';
  const codigoCert = (permiso.id ? String(permiso.id).slice(-8).toUpperCase() : 'SEMINARIO-AUT');

  // Estado para el envío a otro formador personalizado
  const [showFormadorDrawer, setShowFormadorDrawer] = useState(false);
  const [showOtroFormador, setShowOtroFormador] = useState(false);
  const [formadorRol, setFormadorRol] = useState(() => localStorage.getItem('seminario_formador_rol') || 'Padre Formador');
  const [formadorTelefono, setFormadorTelefono] = useState(() => localStorage.getItem('seminario_formador_telefono') || '');

  // Guardar en localStorage para no tener que escribirlo cada vez
  useEffect(() => {
    if (formadorRol) {
      localStorage.setItem('seminario_formador_rol', formadorRol);
    }
  }, [formadorRol]);

  useEffect(() => {
    if (formadorTelefono !== undefined) {
      localStorage.setItem('seminario_formador_telefono', formadorTelefono);
    }
  }, [formadorTelefono]);

  // Compartir general (cualquier chat, estado, grupo o familiar)
  const handleShareGeneral = () => {
    const text = generatePermisoWhatsAppText(permiso, seminarista);
    shareViaWhatsApp(text);
  };

  // Compartir directo a uno de los sacerdotes del equipo formador
  const handleSendToFormadorDirect = (formador) => {
    const text = generatePermisoWhatsAppText(permiso, seminarista, formador.nombre);
    shareViaWhatsApp(text, formador.telefonoRaw);
  };

  // Compartir a formador personalizado
  const handleShareFormadorPersonalizado = () => {
    const text = generatePermisoWhatsAppText(permiso, seminarista, formadorRol);
    shareViaWhatsApp(text, formadorTelefono);
  };

  const FORMADOR_PRESETS = [
    'Padre Rector',
    'Padre Prefecto',
    'Director Espiritual',
    'Padre Formador'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-sm animate-backdropFade">
      <div className="bg-slate-950 text-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh] animate-modalIn">
        
        {/* Marca de agua / Decoración eclesiástica de fondo */}
        <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none text-slate-900">
          <Church className="w-56 h-56" />
        </div>

        {/* Cabecera Fija del Pase */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 text-white text-center border-b-2 border-amber-500 relative">
          <button
            onClick={onClose}
            aria-label="Cerrar pase digital"
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl btn-tactile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-16 sm:h-20 w-auto mx-auto flex items-center justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="Escudo Oficial Seminario Santo Tomás de Aquino - Sacerdos Lux" 
              className="h-full w-auto object-contain filter drop-shadow-md"
            />
          </div>
          <h3 className="font-display font-bold text-xs sm:text-sm tracking-widest uppercase text-amber-200">
            Seminario Mayor Santo Tomás de Aquino
          </h3>
          <p className="text-[11px] text-slate-300 font-light">
            Arquidiócesis de Maracaibo
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pase de Salida Autorizado</span>
          </div>
        </div>

        {/* Contenido con Scroll Interno Suave (Garantiza que los botones nunca se tapen) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-slate-800 custom-scrollbar overscroll-contain">
          
          {/* Ficha del Seminarista */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-800 font-bold flex items-center justify-center font-serif text-lg border border-amber-500/30 flex-shrink-0">
              {seminarista?.nombre?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {seminarista?.nombreCompleto || seminarista?.nombre}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Cédula: <span className="font-mono text-slate-900 font-bold">{seminarista?.cedula}</span>
              </p>
              <p className="text-[11px] text-amber-800 font-semibold truncate">
                {seminarista?.curso} • {formatJurisdiccion(seminarista?.diocesis)}
              </p>
            </div>
          </div>

          {/* Detalles del Permiso */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Destino</span>
              <div className="flex items-center gap-1 text-slate-900 font-bold">
                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">{permiso.destino}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tipo</span>
              <span className="font-bold text-slate-800 block truncate">{permiso.tipoPermiso || 'Personal'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Salida</span>
              <span className="font-semibold text-slate-900 text-[11px] block">
                {formatDateTime(permiso.fechaSalida)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Retorno Previsto</span>
              <span className="font-semibold text-slate-900 text-[11px] block">
                {formatDateTime(permiso.fechaRetorno)}
              </span>
            </div>
          </div>

          {/* Motivo (Caja limpia, nítida y con fondo blanco sólido) */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-sm text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-0.5">
              Motivo de la Salida
            </span>
            <p className="text-slate-800 italic font-medium leading-relaxed">
              "{permiso.motivo}"
            </p>
          </div>

          {/* Observaciones de Rectoría si existen */}
          {permiso.observacionRector && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-0.5">
                Observación / Condición de Rectoría
              </span>
              <p className="text-emerald-950 font-medium leading-relaxed">
                "{permiso.observacionRector}"
              </p>
            </div>
          )}

          {/* Directorio de Envío Rápido al Equipo Formador por WhatsApp */}
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900 overflow-hidden shadow-md">
            <button
              type="button"
              onClick={() => setShowFormadorDrawer(!showFormadorDrawer)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/80 transition-colors btn-tactile"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold flex-shrink-0 border border-amber-500/30">
                  <Church className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-200 block">
                    Enviar a un Padre Formador
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    P. Jorge • P. José Varela • P. Renzo
                  </span>
                </div>
              </div>
              <div className="text-slate-400 pl-2">
                {showFormadorDrawer ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showFormadorDrawer && (
              <div className="p-3.5 pt-1 space-y-2.5 border-t border-slate-800 text-xs animate-fadeIn">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Directorio del Equipo Formador
                </p>

                {/* Lista de Sacerdotes Formadores Oficiales */}
                <div className="space-y-1.5">
                  {FORMADORES_SEMINARIO.map((formador) => (
                    <div
                      key={formador.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 font-bold flex items-center justify-center text-[11px] flex-shrink-0 border border-amber-500/25">
                          {formador.iniciales}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-white truncate">
                            {formador.nombre}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {formador.telefono}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendToFormadorDirect(formador)}
                        className="ml-2 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm btn-tactile flex-shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Botón para expandir personalización */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOtroFormador(!showOtroFormador)}
                    className="text-[11px] text-amber-300/90 hover:text-amber-200 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>{showOtroFormador ? '▲ Ocultar otro destinatario' : '▼ ¿Enviar a otro sacerdote o número?'}</span>
                  </button>
                </div>

                {showOtroFormador && (
                  <div className="pt-2 space-y-2.5 border-t border-slate-800/80 animate-fadeIn">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Cargo / Título
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {FORMADOR_PRESETS.map((cargo) => (
                          <button
                            key={cargo}
                            type="button"
                            onClick={() => setFormadorRol(cargo)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                              formadorRol === cargo
                                ? 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-sm'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {cargo}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Número de WhatsApp (Opcional)
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formadorTelefono}
                          onChange={(e) => setFormadorTelefono(e.target.value)}
                          placeholder="Ej. 04141234567 o 0424..."
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleShareFormadorPersonalizado}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 btn-tactile"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enviar a {formadorRol}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sello de Validación Institucional */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-700">
            <div className="text-[10px] text-slate-400 font-mono leading-tight">
              CERT: #{codigoCert}<br />
              AUTORIZADO POR RECTORÍA
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-amber-300 font-bold">
              OFICIAL 2026-2027
            </div>
          </div>

        </div>

        {/* Botones de Pie Fijos (Siempre visibles sin importar el tamaño de la pantalla) */}
        <div className="flex-shrink-0 p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleShareGeneral}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg btn-tactile flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs btn-tactile"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
