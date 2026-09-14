import React, { useState } from 'react';
import { Wrench, Send, X, AlertCircle } from 'lucide-react';
import { crearSolicitud } from '../../services/firestoreService';

const AREAS_COORDINACION = [
  'Liturgia y Sacristía',
  'Pastoral y Misiones',
  'Música y Canto Litúrgico',
  'Biblioteca y Estudio',
  'Mantenimiento e Infraestructura',
  'Alimentación y Cocina',
  'Deportes y Recreación',
  'Salud y Primeros Auxilios',
  'Comunicaciones y Tecnología',
  'Otra Coordinación'
];

export default function SolicitudNecesidadModal({ isOpen, onClose, seminarista, onSuccess }) {
  const [area, setArea] = useState(AREAS_COORDINACION[0]);
  const [urgencia, setUrgencia] = useState('media'); // 'baja' | 'media' | 'alta'
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!descripcion.trim()) {
      setError('Por favor describe la necesidad de coordinación.');
      return;
    }

    setLoading(true);

    const payload = {
      tipo: 'necesidad',
      seminaristaId: seminarista.id,
      seminaristaNombre: seminarista.nombreCompleto || seminarista.nombre,
      seminaristaCedula: seminarista.cedula,
      seminaristaCurso: seminarista.curso,
      seminaristaDiocesis: seminarista.diocesis,
      area,
      urgencia,
      descripcion: descripcion.trim()
    };

    const res = await crearSolicitud(payload);
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess('Necesidad de coordinación reportada con éxito.');
      onClose();
      setDescripcion('');
    } else {
      setError('No se pudo enviar el reporte. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white flex items-center justify-between border-b border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-sky-100">
                Necesidad de Coordinación
              </h3>
              <p className="text-xs text-slate-300">
                Reportar insumo, reparación o requerimiento operativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Área o Coordinación
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 bg-white"
            >
              {AREAS_COORDINACION.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nivel de Urgencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'baja', label: 'Baja / Rutinaria', color: 'border-slate-300 text-slate-700 hover:bg-slate-50' },
                { id: 'media', label: 'Media / Pronta', color: 'border-amber-300 text-amber-800 hover:bg-amber-50' },
                { id: 'alta', label: 'Alta / Urgente', color: 'border-rose-400 text-rose-800 hover:bg-rose-50' }
              ].map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUrgencia(u.id)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-bold border-2 transition-all ${
                    urgencia === u.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : `${u.color} bg-white`
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción de la Necesidad
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              placeholder="Detalla qué material se necesita, qué elemento requiere reparación o qué situación debe coordinarse..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Acciones */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Enviando...' : 'Enviar Necesidad'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
