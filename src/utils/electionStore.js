import { socket } from './socket';
import { supabase } from './supabase';
import defaultState from '../../server/data/state.json';

export const ALL_COURSES = [
  '1° de Filosofía',
  '2° de Filosofía',
  '3° de Filosofía',
  '1° de Teología',
  '2° de Teología',
  '3° de Teología',
  '4° de Teología'
];

export const DEFAULT_SUBGROUPS = {
  servicios_generales: [
    'Limpieza',
    'Lavandería',
    'Jardinería',
    'Mantenimiento',
    'Hospedería',
    'Campana'
  ],
  liturgia: [
    'Capilla de Teología',
    'Capilla de Filosofía',
    'Sacristán Mayor',
    'Sacristán Menor',
    'Depósito',
    'Mantelería'
  ],
  cultura: [
    'Biblioteca',
    'Redes Sociales',
    'Deporte',
    'Acto Cívico',
    'Películas',
    'Juegos y Recreación'
  ],
  cocina: [
    'Despensa',
    'Meriendas',
    'Subcoordinador',
    'Sala de Padres'
  ]
};

export function calculateResults(votesMap = {}, candidatesList = []) {
  const totalVotes = Object.keys(votesMap).length;
  const tally = {};
  candidatesList.forEach(c => { tally[c.id] = 0; });

  Object.values(votesMap).forEach(candId => {
    if (tally[candId] !== undefined) {
      tally[candId]++;
    }
  });

  const threshold34 = Math.ceil(totalVotes * 0.75);

  const list = candidatesList.map(c => {
    const count = tally[c.id] || 0;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
    return {
      ...c,
      votes: count,
      percentage: Number(percentage.toFixed(1)),
      isWinner34: totalVotes > 0 && count >= threshold34
    };
  }).sort((a, b) => b.votes - a.votes);

  return {
    totalVotes,
    threshold34,
    winnerDirect: list.find(c => c.isWinner34) || null,
    tally: list
  };
}

export function broadcastStateChange(newState, onUpdateState) {
  if (onUpdateState) {
    onUpdateState(newState);
  }

  try {
    localStorage.setItem('coordinacion_election_state', JSON.stringify(newState));
  } catch (e) {}

  try {
    const bc = new BroadcastChannel('coordinacion_election');
    bc.postMessage(newState);
    bc.close();
  } catch (e) {}

  if (supabase) {
    Promise.resolve(
      supabase.from('coord_election_state').upsert({
        id: 'current',
        status: newState.status,
        eligible_courses: newState.eligibleCourses,
        voting_courses: newState.votingCourses,
        candidates: newState.candidates,
        round1_votes: newState.round1Votes || {},
        round2_votes: newState.round2Votes || {},
        runoff_candidates: newState.runoffCandidates || [],
        winner: newState.winner || null,
        coordinations: newState.coordinations || {},
        coordinators: newState.coordinators || {},
        subgroups: newState.subgroups || DEFAULT_SUBGROUPS,
        member_subgroups: newState.memberSubgroups || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
    ).catch(() => {});
  }
}

export async function resetElection(seminaristas = [], onUpdateState) {
  if (socket.connected) {
    socket.emit('election:reset');
  }

  const defaultEligibleCourses = ['2° de Teología', '3° de Teología'];
  const candidateSeminaristas = seminaristas.filter(s => defaultEligibleCourses.includes(s.curso));
  const cleanCandidates = candidateSeminaristas.map(s => ({
    id: s.id,
    nombre: s.nombre,
    curso: s.curso,
    foto: s.foto || null,
    votosR1: 0,
    votosR2: 0
  }));

  const cleanState = {
    status: 'CONFIG',
    eligibleCourses: defaultEligibleCourses,
    votingCourses: ALL_COURSES,
    selectedCandidateIds: candidateSeminaristas.map(s => s.id),
    candidates: cleanCandidates,
    round1Votes: {},
    round2Votes: {},
    runoffCandidates: [],
    winner: null,
    coordinations: {
      liturgia: [],
      cultura: [],
      cocina: [],
      servicios_generales: []
    },
    coordinators: {
      liturgia: null,
      cultura: null,
      cocina: null,
      servicios_generales: null
    },
    subgroups: DEFAULT_SUBGROUPS,
    memberSubgroups: {},
    suspenseTriggeredAt: null,
    r1VoteCount: 0,
    r2VoteCount: 0,
    r1VotedIds: [],
    r2VotedIds: [],
    totalEligibleVoters: seminaristas.length || 38
  };

  try {
    localStorage.removeItem('seminario_voter_id');
    localStorage.removeItem('seminario_voter_cedula');
  } catch (e) {}

  if (supabase) {
    try {
      await supabase.from('coord_votes').delete().neq('voter_id', '__none__');
    } catch (e) {}
  }

  broadcastStateChange(cleanState, onUpdateState);
  return cleanState;
}

export function startRound1(state, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:start_round_1');
  }

  const newState = {
    ...state,
    status: 'ROUND_1_VOTING',
    round1Votes: {},
    winner: null,
    runoffCandidates: [],
    suspenseTriggeredAt: null,
    r1VoteCount: 0,
    r1VotedIds: []
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function triggerSuspense(state, round = 1, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:trigger_suspense', { round });
  }

  const newState = {
    ...state,
    status: round === 1 ? 'ROUND_1_SUSPENSE' : 'ROUND_2_SUSPENSE',
    suspenseTriggeredAt: Date.now()
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function revealResults(state, round = 1, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:reveal_results', { round });
  }

  let newState = { ...state };
  if (round === 1) {
    const results = calculateResults(state.round1Votes || {}, state.candidates || []);
    if (results.winnerDirect) {
      newState = {
        ...newState,
        winner: results.winnerDirect,
        status: 'ROUND_1_RESULTS'
      };
    } else {
      newState = {
        ...newState,
        runoffCandidates: results.tally.slice(0, 2),
        status: 'ROUND_1_RESULTS'
      };
    }
  } else {
    const results = calculateResults(state.round2Votes || {}, state.runoffCandidates || []);
    newState = {
      ...newState,
      winner: results.tally[0] || null,
      status: 'ROUND_2_RESULTS'
    };
  }

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function startRound2(state, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:start_round_2');
  }

  const newState = {
    ...state,
    status: 'ROUND_2_VOTING',
    round2Votes: {},
    r2VoteCount: 0,
    r2VotedIds: []
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function goToCoordinations(state, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:go_to_coordinations');
  }

  const newState = {
    ...state,
    status: 'COORDINATIONS'
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function toggleCandidateInState(state, seminaristaId, seminaristas, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:toggle_candidate', { seminaristaId });
  }

  const sem = seminaristas.find(s => s.id === seminaristaId);
  if (!sem) return state;

  let selected = [...(state.selectedCandidateIds || (state.candidates || []).map(c => c.id))];
  if (selected.includes(seminaristaId)) {
    selected = selected.filter(id => id !== seminaristaId);
  } else {
    selected.push(seminaristaId);
  }

  const eligible = state.eligibleCourses || [];
  const newCandidates = seminaristas
    .filter(s => selected.includes(s.id) && eligible.includes(s.curso))
    .map(s => {
      const existing = (state.candidates || []).find(c => c.id === s.id);
      return existing || {
        id: s.id,
        nombre: s.nombre,
        curso: s.curso,
        foto: s.foto || null,
        votosR1: 0,
        votosR2: 0
      };
    });

  const newState = {
    ...state,
    selectedCandidateIds: selected,
    candidates: newCandidates
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function updateEligibleCoursesInState(state, updatedCourses, seminaristas, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:update_config', { eligibleCourses: updatedCourses });
  }

  const prevCourses = state.eligibleCourses || [];
  const added = updatedCourses.filter(c => !prevCourses.includes(c));
  const removed = prevCourses.filter(c => !updatedCourses.includes(c));

  let currentSelected = [...(state.selectedCandidateIds || (state.candidates || []).map(c => c.id))];

  if (removed.length > 0) {
    currentSelected = currentSelected.filter(id => {
      const s = seminaristas.find(sem => sem.id === id);
      return s && !removed.includes(s.curso);
    });
  }

  if (added.length > 0) {
    const newSem = seminaristas.filter(s => added.includes(s.curso));
    newSem.forEach(s => {
      if (!currentSelected.includes(s.id)) currentSelected.push(s.id);
    });
  }

  const newCandidates = seminaristas
    .filter(s => currentSelected.includes(s.id) && updatedCourses.includes(s.curso))
    .map(s => {
      const existing = (state.candidates || []).find(c => c.id === s.id);
      return existing || {
        id: s.id,
        nombre: s.nombre,
        curso: s.curso,
        foto: s.foto || null,
        votosR1: 0,
        votosR2: 0
      };
    });

  const newState = {
    ...state,
    eligibleCourses: updatedCourses,
    selectedCandidateIds: currentSelected,
    candidates: newCandidates
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function selectAllInCourseInState(state, course, selectAll, seminaristas, onUpdateState) {
  const courseSeminaristas = seminaristas.filter(s => s.curso === course);
  const courseSemIds = courseSeminaristas.map(s => s.id);
  let updatedSelected = [...(state.selectedCandidateIds || (state.candidates || []).map(c => c.id))];

  if (selectAll) {
    courseSemIds.forEach(id => {
      if (!updatedSelected.includes(id)) updatedSelected.push(id);
    });
  } else {
    updatedSelected = updatedSelected.filter(id => !courseSemIds.includes(id));
  }

  if (socket.connected) {
    socket.emit('election:update_config', { selectedCandidateIds: updatedSelected });
  }

  const eligible = state.eligibleCourses || [];
  const newCandidates = seminaristas
    .filter(s => updatedSelected.includes(s.id) && eligible.includes(s.curso))
    .map(s => {
      const existing = (state.candidates || []).find(c => c.id === s.id);
      return existing || {
        id: s.id,
        nombre: s.nombre,
        curso: s.curso,
        foto: s.foto || null,
        votosR1: 0,
        votosR2: 0
      };
    });

  const newState = {
    ...state,
    selectedCandidateIds: updatedSelected,
    candidates: newCandidates
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function assignCoordinationInState(state, seminaristaId, coordinationKey, onUpdateState) {
  if (socket.connected) {
    socket.emit('coordination:assign', { seminaristaId, coordinationKey });
  }

  const validCoords = ['liturgia', 'cultura', 'cocina', 'servicios_generales'];
  const coordinations = { ...(state.coordinations || { liturgia: [], cultura: [], cocina: [], servicios_generales: [] }) };
  const coordinators = { ...(state.coordinators || { liturgia: null, cultura: null, cocina: null, servicios_generales: null }) };
  const memberSubgroups = { ...(state.memberSubgroups || {}) };

  let prevCoord = null;
  validCoords.forEach(key => {
    if ((coordinations[key] || []).includes(seminaristaId)) {
      prevCoord = key;
    }
    coordinations[key] = (coordinations[key] || []).filter(id => id !== seminaristaId);
    if (coordinators[key] === seminaristaId) coordinators[key] = null;
  });

  if (prevCoord !== coordinationKey) {
    memberSubgroups[seminaristaId] = [];
  }

  if (validCoords.includes(coordinationKey)) {
    coordinations[coordinationKey] = [...coordinations[coordinationKey], seminaristaId];
  }

  const newState = {
    ...state,
    coordinations,
    coordinators,
    memberSubgroups
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function setAreaCoordinatorInState(state, coordinationKey, seminaristaId, onUpdateState) {
  if (socket.connected) {
    socket.emit('coordination:set_coordinator', { coordinationKey, seminaristaId });
  }

  const validCoords = ['liturgia', 'cultura', 'cocina', 'servicios_generales'];
  if (!validCoords.includes(coordinationKey)) return state;

  const coordinations = { ...(state.coordinations || { liturgia: [], cultura: [], cocina: [], servicios_generales: [] }) };
  const coordinators = { ...(state.coordinators || { liturgia: null, cultura: null, cocina: null, servicios_generales: null }) };

  if (!(coordinations[coordinationKey] || []).includes(seminaristaId)) {
    validCoords.forEach(k => {
      coordinations[k] = (coordinations[k] || []).filter(id => id !== seminaristaId);
    });
    coordinations[coordinationKey] = [...(coordinations[coordinationKey] || []), seminaristaId];
  }

  coordinators[coordinationKey] = seminaristaId;

  const newState = {
    ...state,
    coordinations,
    coordinators
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function castVoteInState(state, { voterId, candidateId, round }, onUpdateState) {
  if (socket.connected) {
    socket.emit('election:cast_vote', { voterId, candidateId, round });
  }

  const round1Votes = { ...(state.round1Votes || {}) };
  const round2Votes = { ...(state.round2Votes || {}) };

  if (round === 1) {
    round1Votes[voterId] = candidateId;
  } else if (round === 2) {
    round2Votes[voterId] = candidateId;
  }

  const r1VotedIds = Object.keys(round1Votes);
  const r2VotedIds = Object.keys(round2Votes);

  const newState = {
    ...state,
    round1Votes,
    round2Votes,
    r1VoteCount: r1VotedIds.length,
    r2VoteCount: r2VotedIds.length,
    r1VotedIds,
    r2VotedIds
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function toggleMemberSubgroupInState(state, seminaristaId, subgroupName, onUpdateState) {
  if (socket.connected) {
    socket.emit('coordination:toggle_subgroup', { seminaristaId, subgroupName });
  }

  const memberSubgroups = { ...(state.memberSubgroups || {}) };
  const current = [...(memberSubgroups[seminaristaId] || [])];

  if (current.includes(subgroupName)) {
    memberSubgroups[seminaristaId] = current.filter(s => s !== subgroupName);
  } else {
    memberSubgroups[seminaristaId] = [...current, subgroupName];
  }

  const newState = {
    ...state,
    memberSubgroups
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function addSubgroupInState(state, coordinationKey, subgroupName, onUpdateState) {
  const trimmed = (subgroupName || '').trim();
  if (!trimmed) return state;

  if (socket.connected) {
    socket.emit('coordination:add_subgroup', { coordinationKey, subgroupName: trimmed });
  }

  const subgroups = { ...(state.subgroups || DEFAULT_SUBGROUPS) };
  const currentList = [...(subgroups[coordinationKey] || [])];

  if (!currentList.includes(trimmed)) {
    subgroups[coordinationKey] = [...currentList, trimmed];
  }

  const newState = {
    ...state,
    subgroups
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}

export function removeSubgroupInState(state, coordinationKey, subgroupName, onUpdateState) {
  if (socket.connected) {
    socket.emit('coordination:remove_subgroup', { coordinationKey, subgroupName });
  }

  const subgroups = { ...(state.subgroups || DEFAULT_SUBGROUPS) };
  subgroups[coordinationKey] = (subgroups[coordinationKey] || []).filter(s => s !== subgroupName);

  const memberSubgroups = { ...(state.memberSubgroups || {}) };
  Object.keys(memberSubgroups).forEach(semId => {
    if (memberSubgroups[semId]?.includes(subgroupName)) {
      memberSubgroups[semId] = memberSubgroups[semId].filter(s => s !== subgroupName);
    }
  });

  const newState = {
    ...state,
    subgroups,
    memberSubgroups
  };

  broadcastStateChange(newState, onUpdateState);
  return newState;
}
