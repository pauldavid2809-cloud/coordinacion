import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../utils/socket';
import { soundEffects } from '../utils/soundEffects';
import AvatarPlaceholder from './AvatarPlaceholder';
import { 
  Cross, 
  BookOpen, 
  UtensilsCrossed, 
  Wrench, 
  Crown, 
  UserPlus, 
  X, 
  Users, 
  Layers,
  GripVertical,
  ArrowDown
} from 'lucide-react';

export const COORDINATION_DEFS = {
  liturgia: {
    key: 'liturgia',
    title: 'Liturgia',
    subtitle: 'Altar, Celebraciones y Canto',
    gradient: 'from-violet-950/50 via-slate-900/80 to-[#040714]',
    border: 'border-violet-500/40 hover:border-violet-400/80',
    accent: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.12)]',
    icon: Cross
  },
  cultura: {
    key: 'cultura',
    title: 'Cultura',
    subtitle: 'Actos Académicos y Prensa',
    gradient: 'from-blue-950/50 via-slate-900/80 to-[#040714]',
    border: 'border-blue-500/40 hover:border-blue-400/80',
    accent: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    glow: 'shadow-[0_0_20px_rgba(56,189,248,0.12)]',
    icon: BookOpen
  },
  cocina: {
    key: 'cocina',
    title: 'Cocina',
    subtitle: 'Comedor y Servicio Fraterno',
    gradient: 'from-amber-950/50 via-slate-900/80 to-[#040714]',
    border: 'border-amber-500/40 hover:border-amber-400/80',
    accent: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    icon: UtensilsCrossed
  },
  servicios_generales: {
    key: 'servicios_generales',
    title: 'Servicios Generales',
    subtitle: 'Mantenimiento y Logística',
    gradient: 'from-emerald-950/50 via-slate-900/80 to-[#040714]',
    border: 'border-emerald-500/40 hover:border-emerald-400/80',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    icon: Wrench
  }
};

export default function Board4Coord({ 
  state, 
  seminaristas = [], 
  isTabletAdmin = false 
}) {
  const [selectedSemId, setSelectedSemId] = useState(null);
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [searchPool, setSearchPool] = useState('');
  const [draggedSemId, setDraggedSemId] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);

  const coordinations = state?.coordinations || {
    liturgia: [],
    cultura: [],
    cocina: [],
    servicios_generales: []
  };
  const coordinators = state?.coordinators || {};
  const generalCoordinatorId = state?.winner?.id;

  const assignedIds = new Set([
    ...coordinations.liturgia,
    ...coordinations.cultura,
    ...coordinations.cocina,
    ...coordinations.servicios_generales
  ]);

  const unassignedSeminaristas = seminaristas.filter(s => {
    if (s.id === generalCoordinatorId) return false;
    if (assignedIds.has(s.id)) return false;
    if (filterCourse !== 'ALL' && s.curso !== filterCourse) return false;
    if (searchPool && !s.nombre.toLowerCase().includes(searchPool.toLowerCase())) return false;
    return true;
  });

  const handleAssign = (seminaristaId, targetCoordKey) => {
    soundEffects.playClick();
    socket.emit('coordination:assign', {
      seminaristaId,
      coordinationKey: targetCoordKey
    });
    setSelectedSemId(null);
    setDraggedSemId(null);
    setDragOverZone(null);
  };

  const handleSetCoordinator = (coordinationKey, seminaristaId) => {
    soundEffects.playClick();
    socket.emit('coordination:set_coordinator', {
      coordinationKey,
      seminaristaId
    });
  };

  const handleUnassign = (seminaristaId) => {
    soundEffects.playClick();
    socket.emit('coordination:assign', {
      seminaristaId,
      coordinationKey: 'unassigned'
    });
    setDraggedSemId(null);
    setDragOverZone(null);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, semId) => {
    if (!isTabletAdmin) return;
    e.dataTransfer.setData('text/plain', semId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSemId(semId);
  };

  const handleDragEnd = () => {
    setDraggedSemId(null);
    setDragOverZone(null);
  };

  const handleDragOver = (e, zoneKey) => {
    if (!isTabletAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverZone !== zoneKey) {
      setDragOverZone(zoneKey);
    }
  };

  const handleDrop = (e, targetCoordKey) => {
    if (!isTabletAdmin) return;
    e.preventDefault();
    const semId = e.dataTransfer.getData('text/plain') || draggedSemId;
    if (semId) {
      if (targetCoordKey === 'unassigned') {
        handleUnassign(semId);
      } else {
        handleAssign(semId, targetCoordKey);
      }
    }
    setDraggedSemId(null);
    setDragOverZone(null);
  };

  const allCourses = Array.from(new Set(seminaristas.map(s => s.curso)));
  const selectedSeminarista = seminaristas.find(s => s.id === selectedSemId);
  const draggedSeminarista = seminaristas.find(s => s.id === draggedSemId);

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col space-y-2 h-full overflow-hidden">
      {/* Top Banner: General Coordinator Grand Display (Compact ribbon) */}
      {state?.winner && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full card-senior-gold rounded-xl px-3.5 py-1.5 flex items-center justify-between gap-3 shrink-0 shadow-md border border-amber-400/40"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400 bg-slate-950 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              {state.winner.foto ? (
                <img src={state.winner.foto} alt={state.winner.nombre} className="w-full h-full object-cover" />
              ) : (
                <AvatarPlaceholder name={state.winner.nombre} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Coordinador General Electo</span>
                </span>
                <span className="h-1 w-1 rounded-full bg-amber-400/60"></span>
                <span className="text-[10px] font-mono text-slate-300">{state.winner.curso}</span>
              </div>
              <h3 className="text-sm sm:text-base font-serif font-black text-white leading-tight truncate">
                {state.winner.nombre}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 bg-[#050817] px-3 py-1 rounded-lg border border-white/[0.08]">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Asignados: <strong className="text-amber-300">{assignedIds.size}</strong> / <strong className="text-white">{seminaristas.length - 1}</strong></span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tablet Admin: Ultra-compact Assignment Drawer (~110px max height) with Drag & Drop */}
      {isTabletAdmin && (
        <div 
          onDragOver={(e) => handleDragOver(e, 'unassigned')}
          onDrop={(e) => handleDrop(e, 'unassigned')}
          className={`card-senior rounded-2xl p-2 sm:p-2.5 shrink-0 space-y-1.5 shadow-lg transition-all border ${
            dragOverZone === 'unassigned' 
              ? 'ring-2 ring-rose-400/60 bg-rose-950/20 border-rose-400' 
              : 'border-white/[0.08]'
          }`}
        >
          {/* Header Row: Title + Hints + Search & Filter */}
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 min-w-0">
              <UserPlus className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                Seminaristas Pendientes por Asignar <strong className="text-amber-400 font-mono">({unassignedSeminaristas.length})</strong>
              </span>
              <span className="hidden lg:inline text-[11px] text-slate-400 truncate">
                • <strong className="text-amber-300">Arrastra</strong> a una coordinación o <strong className="text-amber-300">toca</strong> para colocar
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Buscar nombre..."
                value={searchPool}
                onChange={(e) => setSearchPool(e.target.value)}
                className="h-7 px-2.5 bg-[#040714] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 w-32 sm:w-44 focus:outline-none focus:border-amber-400"
              />
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="h-7 px-2 bg-[#040714] border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="ALL">Todos los Cursos</option>
                {allCourses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Seminaristas Pool Chips: Compact 2-row max wrap */}
          <div className="flex flex-wrap gap-1.5 max-h-[72px] sm:max-h-[80px] overflow-y-auto p-0.5 custom-scrollbar">
            {unassignedSeminaristas.length === 0 ? (
              <span className="text-xs text-emerald-400 font-semibold italic py-1 flex items-center gap-1.5">
                <span>✓</span> Todos los seminaristas han sido distribuidos en sus coordinaciones pastorales.
              </span>
            ) : (
              unassignedSeminaristas.map(s => {
                const isSelected = selectedSemId === s.id;
                const isBeingDragged = draggedSemId === s.id;

                return (
                  <button
                    key={s.id}
                    type="button"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, s.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSemId(isSelected ? null : s.id);
                    }}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-grab active:cursor-grabbing transition-all select-none ${
                      isBeingDragged
                        ? 'opacity-40 scale-95 border-amber-400 ring-2 ring-amber-400'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/60 shadow-md font-bold'
                        : 'bg-[#050817] text-slate-200 border-white/[0.08] hover:border-amber-500/50 hover:bg-slate-900/80'
                    }`}
                  >
                    <GripVertical className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0" />
                    <span className="truncate max-w-[130px] sm:max-w-[160px]">{s.nombre}</span>
                    <span className="text-[10px] opacity-75 font-mono shrink-0">({s.curso.split(' ')[0]})</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Fast Tap-to-Place Floating Bar (When a seminarista is clicked) */}
          <AnimatePresence>
            {selectedSemId && selectedSeminarista && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-1.5 border-t border-amber-400/30 flex flex-wrap items-center justify-between gap-2 overflow-hidden"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-xs text-amber-300 truncate">
                    Colocar a <strong className="text-white font-bold">{selectedSeminarista.nombre}</strong> en:
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.values(COORDINATION_DEFS).map(def => (
                    <button
                      key={def.key}
                      onClick={() => handleAssign(selectedSemId, def.key)}
                      className="px-2.5 py-1 rounded-lg bg-[#040714] hover:bg-slate-900 border border-white/[0.15] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <def.icon className={`w-3.5 h-3.5 ${def.accent}`} />
                      <span>{def.title}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedSemId(null)}
                    title="Cancelar selección"
                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-white/[0.1]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* The 4 Coordinaciones Grid with Drop Zones (Fills remaining height, NO clipping, NO truncation) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 flex-1 min-h-0 h-full w-full">
        {Object.values(COORDINATION_DEFS).map(def => {
          const memberIds = coordinations[def.key] || [];
          const members = memberIds.map(id => seminaristas.find(s => s.id === id)).filter(Boolean);
          const coordinatorId = coordinators[def.key];
          const coordinator = seminaristas.find(s => s.id === coordinatorId);

          const isOverThisCoord = isTabletAdmin && dragOverZone === def.key;
          const isDraggingActive = isTabletAdmin && (draggedSemId !== null || selectedSemId !== null);

          return (
            <div
              key={def.key}
              onDragOver={(e) => handleDragOver(e, def.key)}
              onDragLeave={() => { if (dragOverZone === def.key) setDragOverZone(null); }}
              onDrop={(e) => handleDrop(e, def.key)}
              className={`rounded-2xl border transition-all duration-200 relative flex flex-col min-h-0 h-full overflow-hidden p-2 sm:p-2.5 shadow-xl ${
                isOverThisCoord 
                  ? 'border-amber-300 ring-2 ring-amber-400/50 bg-amber-500/20 scale-[1.01]'
                  : isDraggingActive
                  ? `${def.border} border-dashed bg-gradient-to-b ${def.gradient}`
                  : `${def.border} bg-gradient-to-b ${def.gradient}`
              } ${def.glow}`}
            >
              {/* Drop Target Indicator Overlay when Dragging */}
              {isOverThisCoord && (
                <div className="absolute inset-0 z-30 bg-amber-500/25 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-3 border-2 border-dashed border-amber-300 pointer-events-none animate-pulse">
                  <ArrowDown className="w-6 h-6 text-amber-300 mb-1 animate-bounce" />
                  <span className="font-serif font-black text-white text-sm text-center">
                    Soltar en {def.title}
                  </span>
                  <span className="text-xs text-amber-200 font-bold truncate max-w-full">
                    {draggedSeminarista?.nombre}
                  </span>
                </div>
              )}

              {/* Card Header - Guaranteed no truncation for "Servicios Generales" */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.08] shrink-0 gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#040714] border border-white/[0.1] flex items-center justify-center ${def.accent} shadow-inner shrink-0`}>
                    <def.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-black text-xs sm:text-sm xl:text-base text-white whitespace-nowrap leading-tight tracking-tight">
                      {def.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5 max-w-[110px] xl:max-w-[160px]">
                      {def.subtitle}
                    </span>
                  </div>
                </div>

                <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${def.badge} shrink-0`}>
                  {members.length}
                </div>
              </div>

              {/* Area Coordinator Ribbon */}
              <div className="mb-1.5 shrink-0">
                {coordinator ? (
                  <div className="bg-amber-500/15 border border-amber-400/50 rounded-lg p-1.5 px-2 flex items-center justify-between gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider block leading-none">
                          Coordinador
                        </span>
                        <span className="text-xs font-serif font-bold text-white truncate block leading-tight">
                          {coordinator.nombre}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-sky-300 shrink-0">
                      {coordinator.curso?.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-dashed border-white/[0.08] rounded-lg p-1 text-[10px] text-center text-slate-500 font-medium">
                    Sin coordinador asignado
                  </div>
                )}
              </div>

              {/* Tablet Quick Place Button (if seminarista selected via tap) */}
              {isTabletAdmin && selectedSemId && (
                <button
                  onClick={() => handleAssign(selectedSemId, def.key)}
                  className="mb-1.5 py-1 px-2 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-amber-400 transition-all shrink-0 animate-pulse"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="truncate">Colocar aquí</span>
                </button>
              )}

              {/* Members List with Framer Motion layout animation & drag capability */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {members.length === 0 ? (
                  <div className="h-full min-h-[60px] flex flex-col items-center justify-center text-center text-xs text-slate-500 italic space-y-1">
                    <Layers className="w-4 h-4 text-slate-700" />
                    <span>Sin seminaristas</span>
                    {isTabletAdmin && (
                      <span className="text-[10px] text-amber-400/80 not-italic font-sans font-medium">
                        Arrastra aquí
                      </span>
                    )}
                  </div>
                ) : (
                  members.map(m => {
                    const isAreaHead = m.id === coordinatorId;
                    const isBeingDragged = draggedSemId === m.id;

                    return (
                      <motion.div
                        layout
                        key={m.id}
                        draggable={isTabletAdmin}
                        onDragStart={(e) => handleDragStart(e, m.id)}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className={`flex items-center justify-between gap-1 py-1 px-2 rounded-lg border transition-all ${
                          isBeingDragged
                            ? 'opacity-40 scale-95 border-amber-400'
                            : isAreaHead
                            ? 'bg-amber-500/15 border-amber-400/50 shadow-sm'
                            : 'bg-[#050817] border-white/[0.08] hover:border-white/[0.18]'
                        } ${isTabletAdmin ? 'cursor-grab active:cursor-grabbing select-none' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {isTabletAdmin && (
                            <GripVertical className="w-3 h-3 text-slate-500 hover:text-amber-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-serif font-bold text-white block truncate leading-tight">
                              {m.nombre}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block leading-none">
                              {m.curso}
                            </span>
                          </div>
                        </div>

                        {/* Tablet Controls */}
                        {isTabletAdmin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              title={isAreaHead ? 'Coordinador de Área' : 'Designar Coordinador de esta área'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCoordinator(def.key, m.id);
                              }}
                              className={`p-1 rounded-lg border transition-colors ${
                                isAreaHead 
                                  ? 'bg-amber-500 text-slate-950 border-amber-300' 
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
                              }`}
                            >
                              <Crown className="w-3 h-3" />
                            </button>
                            <button
                              title="Desasignar a pendientes"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassign(m.id);
                              }}
                              className="p-1 rounded-lg bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
