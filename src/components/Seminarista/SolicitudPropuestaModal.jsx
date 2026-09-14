import React, { useState } from 'react';
import { Lightbulb, Send, X, AlertCircle } from 'lucide-react';
import { crearSolicitud } from '../../services/supabaseService.js';

const DIMENSIONES = [
  'Vida Comunitaria y Fraternidad',
  'Espiritualidad y Liturgia',
  'Dimensión Académica e Intelectual',
  'Pastoral y Apostolado',
  'Deportes, Cultura y Recreación',
  'Mejora de Instalaciones'
];

export default function SolicitudPropuestaModal({ isOpen, onClose, seminarista, onSuccess }) {
  const [titulo, setTitulo] = useState('');
  const [dimension, setDimension] = useState(DIMENSIONES[0]);
  const [justificacion, setJustificacion] = useState('');
  const [detalles, setDetalles] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim() || !justificacion.trim() || !detalles.trim()) {
      setError('Por favor completa todos los campos de la propuesta.');
      return;
    }

    setLoading(true);

    const payload = {
      tipo: 'propuesta',
      seminaristaId: seminarista.id,
      seminaristaNombre: seminarista.nombreCompleto || seminarista.nombre,
      seminaristaCedula: seminarista.cedula,
      seminaristaCurso: seminarista.curso,
      seminaristaDiocesis: seminarista.diocesis,
      titulo: titulo.trim(),
      dimension,
      justificacion: justificacion.trim(),
      detalles: detalles.trim()
    };

    const res = await crearSolicitud(payload);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess('Propuesta enviada al equipo formador con éxito.');
      onClose();
      setTitulo('');
      setJustificacion('');
      setDetalles('');
    } else {
      setError('No se pudo enviar la propuesta. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-modalIn">
        
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-indigo-100">
                Presentar Nueva Propuesta
              </h3>
              <p className="text-xs text-slate-300">
                Iniciativas y mejoras para la comunidad del seminario
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
              Título de la Propuesta
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Taller de Canto Gregoriano / Jornada de Mantenimiento Parroquial"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 transition-[border-color,box-shadow] duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dimensión Formativa
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 bg-white transition-[border-color,box-shadow] duration-150"
            >
              {DIMENSIONES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Justificación / Beneficio para la Comunidad
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={2}
              placeholder="¿Por qué es conveniente o necesaria esta iniciativa? ¿A quiénes beneficiará?"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detalles y Plan de Ejecución
            </label>
            <textarea
              value={detalles}
              onChange={(e) => setDetalles(e.target.value)}
              rows={3}
              placeholder="Describe cómo se llevaría a cabo, qué recursos se requieren, fechas tentativas..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
            />
          </div>

          {/* Acciones */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md btn-tactile flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Enviando...' : 'Enviar Propuesta'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
