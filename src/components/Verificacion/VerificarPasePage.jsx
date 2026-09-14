import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  Church, 
  ArrowLeft, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { formatDateTime, formatJurisdiccion } from '../../utils/formatters.js';
import { generatePermisoWhatsAppText, shareViaWhatsApp, getPermisoVerificationUrl } from '../../utils/whatsappShare.js';

export default function VerificarPasePage({ permiso, seminarista, onVolver, isLoading = false, error = null }) {
  const [copiado, setCopiado] = useState(false);

  // Copiar link al portapapeles
  const handleCopiarEnlace = () => {
    if (!permiso?.id) return;
    const url = getPermisoVerificationUrl(permiso.id);
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // Compartir por WhatsApp
  const handleCompartir = () => {
    if (!permiso) return;
    const text = generatePermisoWhatsAppText(permiso, seminarista);
    shareViaWhatsApp(text);
  };

  // 1. Estado de Carga
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 animate-pulse">
          <div className="h-20 w-auto mx-auto flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Seminario Mayor Santo Tomás de Aquino" 
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="font-display font-bold text-lg text-amber-200 uppercase tracking-widest">
            Verificando Pase Digital
          </h2>
          <p className="text-xs text-slate-400">
            Consultando los registros oficiales de Rectoría del Seminario Santo Tomás de Aquino...
          </p>
        </div>
      </div>
    );
  }

  // 2. Estado de Error / Pase No Encontrado
  if (error || !permiso) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4 animate-modalIn">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-white">
            Pase No Encontrado
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {error || 'El código de verificación o enlace no coincide con ningún pase de salida activo en el sistema oficial del Seminario Mayor Santo Tomás de Aquino.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onVolver}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg btn-tactile flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir a la Página Principal del Seminario</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Evaluación Dinámica de Vigencia Temporal
  const isAprobado = (permiso.estado || '').toLowerCase() === 'aprobado';
  const codigoCert = (permiso.id ? String(permiso.id).slice(-8).toUpperCase() : 'SEMINARIO-AUT');
  const now = new Date();
  const salidaDate = permiso.fechaSalida ? new Date(permiso.fechaSalida) : null;
  const retornoDate = permiso.fechaRetorno ? new Date(permiso.fechaRetorno) : null;

  let badgeVigencia = null;

  if (!isAprobado) {
    badgeVigencia = {
      tipo: 'no-aprobado',
      titulo: `ESTADO: ${(permiso.estado || 'PENDIENTE').toUpperCase()}`,
      subtitulo: 'Este pase no figura como aprobado por Rectoría.',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-500/50',
      icono: AlertTriangle
    };
  } else if (retornoDate && now > retornoDate) {
    badgeVigencia = {
      tipo: 'cumplido',
      titulo: 'HORARIO DE RETORNO CUMPLIDO',
      subtitulo: `La hora prevista de regreso finalizó el ${formatDateTime(permiso.fechaRetorno)}.`,
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-400/50',
      icono: Clock
    };
  } else if (salidaDate && now < salidaDate) {
    badgeVigencia = {
      tipo: 'pendiente-salida',
      titulo: 'AUTORIZADO • PENDIENTE DE SALIDA',
      subtitulo: `Salida programada para el ${formatDateTime(permiso.fechaSalida)}.`,
      bgColor: 'bg-sky-500/20',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-400/50',
      icono: Calendar
    };
  } else {
    badgeVigencia = {
      tipo: 'vigente',
      titulo: 'PASE VIGENTE Y AUTORIZADO',
      subtitulo: `El seminarista cuenta con autorización activa hasta el ${formatDateTime(permiso.fechaRetorno)}.`,
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-400/60',
      icono: CheckCircle2
    };
  }

  const IconoBadge = badgeVigencia.icono;

  // Datos consolidados del seminarista (vienen del objeto seminarista o embebidos en el permiso)
  const nombreSeminarista = seminarista?.nombreCompleto || seminarista?.nombre || permiso.seminaristaNombre || 'Seminarista';
  const cedulaSeminarista = seminarista?.cedula || permiso.seminaristaCedula || 'N/A';
  const cursoSeminarista = seminarista?.curso || permiso.seminaristaCurso || '';
  const diocesisSeminarista = seminarista?.diocesis || permiso.seminaristaDiocesis || 'Maracaibo';

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-500/30">
      
      {/* Barra Superior con Escudo y Botón Volver */}
      <header className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-amber-500/30 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <button
            onClick={onVolver}
            className="text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 btn-tactile min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Inicio del Seminario</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>CERT: #{codigoCert}</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal de Verificación */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* Encabezado Eclesiástico Oficial */}
        <div className="text-center space-y-2 py-2">
          <div className="h-20 w-auto mx-auto flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Escudo Oficial Seminario Santo Tomás de Aquino - Sacerdos Lux" 
              className="h-full w-auto object-contain filter drop-shadow-xl"
            />
          </div>
          <h1 className="font-display font-bold text-sm sm:text-base tracking-widest uppercase text-amber-200">
            Seminario Mayor Santo Tomás de Aquino
          </h1>
          <p className="text-xs text-slate-300 font-light">
            Arquidiócesis de Maracaibo • Sistema Oficial de Certificación de Rectoría
          </p>
          <div className="pt-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              PORTAL DE VERIFICACIÓN OFICIAL DE PASES DE SALIDA
            </span>
          </div>
        </div>

        {/* Insignia Dinámica de Vigencia */}
        <div className={`p-4 rounded-2xl border ${badgeVigencia.borderColor} ${badgeVigencia.bgColor} text-center space-y-1 shadow-lg animate-fadeIn`}>
          <div className="inline-flex items-center gap-2 text-sm sm:text-base font-black tracking-wider uppercase">
            <IconoBadge className={`w-5 h-5 ${badgeVigencia.textColor} flex-shrink-0 animate-bounce`} />
            <span className={badgeVigencia.textColor}>{badgeVigencia.titulo}</span>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            {badgeVigencia.subtitulo}
          </p>
        </div>

        {/* Ficha Oficial del Seminarista */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-md text-slate-900 flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 text-amber-800 font-bold flex items-center justify-center font-serif text-xl border border-amber-500/30 flex-shrink-0">
            {nombreSeminarista.charAt(0) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 tracking-wider">
              Seminarista Autorizado
            </span>
            <h2 className="font-bold text-base text-slate-900 leading-snug">
              {nombreSeminarista}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Cédula de Identidad: <span className="font-mono text-slate-950 font-bold">{cedulaSeminarista}</span>
            </p>
            <p className="text-xs text-amber-800 font-semibold mt-0.5">
              {cursoSeminarista && `${cursoSeminarista} • `}{formatJurisdiccion(diocesisSeminarista)}
            </p>
          </div>
        </div>

        {/* Detalles del Pase en Cuadrícula */}
        <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-900">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Destino
            </span>
            <div className="flex items-start gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{permiso.destino || 'No especificado'}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Tipo de Permiso
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
              {permiso.tipoPermiso || 'Personal'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Salida Autorizada
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
              {formatDateTime(permiso.fechaSalida)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Retorno Previsto
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
              {formatDateTime(permiso.fechaRetorno)}
            </span>
          </div>
        </div>

        {/* Motivo de la Salida */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm text-xs text-slate-900">
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
            Motivo de la Salida
          </span>
          <p className="text-slate-800 italic font-medium text-xs sm:text-sm leading-relaxed">
            "{permiso.motivo || 'Sin motivo detallado'}"
          </p>
        </div>

        {/* Observaciones o Condiciones de Rectoría si existen */}
        {permiso.observacionRector && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-1">
              Observación / Condición de Rectoría
            </span>
            <p className="text-emerald-950 font-medium text-xs sm:text-sm leading-relaxed">
              "{permiso.observacionRector}"
            </p>
          </div>
        )}

        {/* Sello de Certificación Digital */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Código de Certificación
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm tracking-wider">
                #{codigoCert}
              </span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Resolución de Rectoría
              </span>
              <span className="text-slate-200 font-medium text-[11px] block">
                {permiso.fechaResolucion ? formatDateTime(permiso.fechaResolucion) : 'Verificado en vivo'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Documento Oficial Verificado
            </span>
            <span className="font-mono text-[10px]">
              Año Formativo 2026-2027
            </span>
          </div>
        </div>

        {/* Acciones para el Formador / Visitante */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleCopiarEnlace}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 btn-tactile min-h-[44px]"
            >
              {copiado ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Enlace Oficial Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copiar Enlace de Verificación</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCompartir}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 btn-tactile min-h-[44px]"
            >
              <Share2 className="w-4 h-4" />
              <span>Reenviar por WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onVolver}
            className="w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs transition-colors min-h-[44px]"
          >
            Volver a la Página Principal del Seminario
          </button>
        </div>

      </main>

      {/* Pie de Página Institucional */}
      <footer className="border-t border-slate-850 py-5 text-center text-xs text-slate-500">
        <div className="max-w-2xl mx-auto px-4 space-y-1">
          <p className="font-serif font-bold text-slate-400">
            Seminario Mayor Santo Tomás de Aquino
          </p>
          <p className="text-[11px] text-slate-500">
            Arquidiócesis de Maracaibo • Sistema de Gestión Formativa 2026-2027
          </p>
        </div>
      </footer>

    </div>
  );
}
