import React, { useState } from 'react';
import { Users, Search, UserPlus, Edit2, Phone, GraduationCap, Church, X, Check, Save } from 'lucide-react';
import { guardarSeminarista } from '../../services/firestoreService';
import { formatCedulaVenezolana } from '../../utils/formatters';

const CURSOS_DISPONIBLES = [
  '1° de Filosofía',
  '2° de Filosofía',
  '3° de Filosofía',
  '1° de Teología',
  '2° de Teología',
  '3° de Teología',
  '4° de Teología'
];

const DIOCESIS_DISPONIBLES = [
  'Maracaibo',
  'Cabimas',
  'Coro',
  'Machiques',
  'El Vigía - San Carlos',
  'Otra Diócesis'
];

export default function PadronSeminaristas({ seminaristas = [], solicitudes = [], onNotify }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEtapa, setFiltroEtapa] = useState('todas'); // 'todas' | 'Filosofía' | 'Teología'
  const [modalEditar, setModalEditar] = useState(null); // null o seminarista obj
  const [formData, setFormData] = useState({
    nombre: '',
    nombreCompleto: '',
    cedula: '',
    telefono: '',
    curso: CURSOS_DISPONIBLES[0],
    etapa: 'Filosofía',
    diocesis: 'Maracaibo'
  });
  const [loading, setLoading] = useState(false);

  const filtrados = seminaristas.filter(s => {
    if (filtroEtapa !== 'todas' && s.etapa !== filtroEtapa) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const n = (s.nombreCompleto || s.nombre || '').toLowerCase();
      const c = (s.cedula || '').toLowerCase();
      const cur = (s.curso || '').toLowerCase();
      const d = (s.diocesis || '').toLowerCase();
      return n.includes(q) || c.includes(q) || cur.includes(q) || d.includes(q);
    }
    return true;
  });

  const abrirNuevo = () => {
    setFormData({
      id: 'sem-' + Date.now(),
      nombre: '',
      nombreCompleto: '',
      cedula: '',
      telefono: '',
      curso: CURSOS_DISPONIBLES[0],
      etapa: 'Filosofía',
      diocesis: 'Maracaibo'
    });
    setModalEditar('nuevo');
  };

  const abrirEditar = (sem) => {
    setFormData({ ...sem });
    setModalEditar('editar');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ajustar etapa automáticamente según el curso
    const etapaCalculada = formData.curso.includes('Filosofía') ? 'Filosofía' : 'Teología';
    const payload = {
      ...formData,
      etapa: etapaCalculada,
      cedula: formatCedulaVenezolana(formData.cedula) || formData.cedula
    };

    await guardarSeminarista(payload);
    setLoading(false);

    if (onNotify) {
      onNotify(modalEditar === 'nuevo' ? 'Seminarista agregado al padrón.' : 'Datos del seminarista actualizados.');
    }
    setModalEditar(null);
  };

  const totalFilosofia = seminaristas.filter(s => s.etapa === 'Filosofía').length;
  const totalTeologia = seminaristas.filter(s => s.etapa === 'Teología').length;

  return (
    <div className="space-y-4">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Total Seminaristas</span>
            <span className="text-2xl font-serif font-bold text-slate-900">{seminaristas.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Etapa Filosofía</span>
            <span className="text-2xl font-serif font-bold text-amber-700">{totalFilosofia}</span>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">1° a 3°</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Etapa Teología</span>
            <span className="text-2xl font-serif font-bold text-sky-800">{totalTeologia}</span>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded">1° a 4°</span>
        </div>
      </div>

      {/* Barra de Búsqueda y Botón Agregar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar seminarista por nombre, cédula o diócesis..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroEtapa}
            onChange={(e) => setFiltroEtapa(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
          >
            <option value="todas">Todas las etapas</option>
            <option value="Filosofía">Filosofía</option>
            <option value="Teología">Teología</option>
          </select>

          <button
            onClick={abrirNuevo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm btn-tactile whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Grid del Padrón */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map(sem => {
          const conteoSolicitudes = solicitudes.filter(s => s.seminaristaId === sem.id).length;

          return (
            <div
              key={sem.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 card-tactile shadow-sm flex flex-col justify-between stagger-item"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 font-serif font-bold text-base flex items-center justify-center border border-amber-200">
                      {sem.nombre?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1">
                        {sem.nombreCompleto || sem.nombre}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-500 font-medium">
                        {sem.cedula}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirEditar(sem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 btn-tactile"
                    title="Editar seminarista"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{sem.curso}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Church className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span>Diócesis de {sem.diocesis}</span>
                  </div>
                  {sem.telefono && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{sem.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Historial:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {conteoSolicitudes} solicitudes
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Agregar / Editar */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdropFade">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 animate-modalIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-base text-slate-900">
                {modalEditar === 'nuevo' ? 'Nuevo Seminarista' : 'Editar Datos del Seminarista'}
              </h3>
              <button
                onClick={() => setModalEditar(null)}
                className="text-slate-400 hover:text-slate-700 btn-tactile p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo (Apellidos, Nombres)
                </label>
                <input
                  type="text"
                  value={formData.nombreCompleto}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      nombreCompleto: e.target.value,
                      nombre: formData.nombre || e.target.value.split(',')[1]?.trim() || e.target.value 
                    });
                  }}
                  required
                  placeholder="Ej. PÉREZ RAMOS, Juan José"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                  placeholder="Ej. V-30.123.456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Curso
                  </label>
                  <select
                    value={formData.curso}
                    onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {CURSOS_DISPONIBLES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Diócesis
                  </label>
                  <select
                    value={formData.diocesis}
                    onChange={(e) => setFormData({ ...formData, diocesis: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {DIOCESIS_DISPONIBLES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej. 0414-1234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 btn-tactile"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center gap-1.5 btn-tactile"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
