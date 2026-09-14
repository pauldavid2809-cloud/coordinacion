import React, { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, Send, X, AlertCircle } from 'lucide-react';
import { crearSolicitud } from '../../services/supabaseService.js';

const TIPOS_PERMISO = [
  'Médico / Odontológico',
  'Trámite Personal / Legal',
  'Visita Familiar',
  'Labor Pastoral / Parroquial',
  'Académico / Estudio',
  'Otro motivo justificado'
];

export default function SolicitudPermisoModal({ isOpen, onClose, seminarista, onSuccess }) {
  const [tipoPermiso, setTipoPermiso] = useState(TIPOS_PERMISO[0]);
  const [motivo, setMotivo] = useState('');
  const [destino, setDestino] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaRetorno, setFechaRetorno] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!motivo.trim() || !destino.trim() || !fechaSalida || !fechaRetorno) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (new Date(fechaRetorno) <= new Date(fechaSalida)) {
      setError('La fecha y hora de retorno debe ser posterior a la de salida.');
      return;
    }

    setLoading(true);

    const payload = {
      tipo: 'permiso',
      seminaristaId: seminarista.id,
      seminaristaNombre: seminarista.nombreCompleto || seminarista.nombre,
      seminaristaCedula: seminarista.cedula,
      seminaristaCurso: seminarista.curso,
      seminaristaDiocesis: seminarista.diocesis,
      tipoPermiso,
      motivo: motivo.trim(),
      destino: destino.trim(),
      fechaSalida,
      fechaRetorno
    };

    const res = await crearSolicitud(payload);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess('Permiso solicitado correctamente.');
      onClose();
      // Reset
      setMotivo('');
      setDestino('');
      setFechaSalida('');
      setFechaRetorno('');
    } else {
      setError('No se pudo enviar la solicitud. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-modalIn">
        
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amber-100">
                Solicitud de Permiso de Salida
              </h3>
              <p className="text-xs text-slate-300">
                {seminarista?.nombreCompleto || seminarista?.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white btn-tactile p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-slideDown">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Permiso
            </label>
            <select
              value={tipoPermiso}
              onChange={(e) => setTipoPermiso(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm text-slate-800 bg-white"
            >
              {TIPOS_PERMISO.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lugar de Destino
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej. Centro Médico La Sagrada Familia / Casa familiar"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha y Hora de Salida
              </label>
              <input
                type="datetime-local"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Retorno Estimado
              </label>
              <input
                type="datetime-local"
                value={fechaRetorno}
                onChange={(e) => setFechaRetorno(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Motivo o Justificación Detallada
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Explica la razón del permiso y cualquier detalle relevante para los formadores..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 btn-tactile"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md btn-tactile flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Enviando...' : 'Enviar Solicitud'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
