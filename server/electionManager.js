import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncStateToSupabase, recordVoteInSupabase, logAuditEvent } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEMINARISTAS_PATH = path.join(__dirname, 'data', 'seminaristas.json');
const STATE_BACKUP_PATH = path.join(__dirname, 'data', 'state.json');

export class ElectionManager {
  constructor(io) {
    this.io = io;
    this.seminaristas = JSON.parse(fs.readFileSync(SEMINARISTAS_PATH, 'utf-8'));
    this.state = this.getInitialState();
    this.loadStateBackup();
  }

  getInitialState() {
    const defaultEligibleCourses = ['2° de Teología', '3° de Teología'];
    const allCourses = [
      '1° de Filosofía',
      '2° de Filosofía',
      '3° de Filosofía',
      '1° de Teología',
      '2° de Teología',
      '3° de Teología',
      '4° de Teología'
    ];

    const candidates = this.seminaristas
      .filter(s => defaultEligibleCourses.includes(s.curso))
      .map(s => ({
        id: s.id,
        nombre: s.nombre,
        curso: s.curso,
        foto: s.foto || null,
        votosR1: 0,
        votosR2: 0
      }));

    return {
      status: 'CONFIG', // CONFIG, ROUND_1_VOTING, ROUND_1_SUSPENSE, ROUND_1_RESULTS, ROUND_2_VOTING, ROUND_2_SUSPENSE, ROUND_2_RESULTS, COORDINATIONS, FINISHED
      eligibleCourses: defaultEligibleCourses,
      votingCourses: allCourses,
      candidates,
      round1Votes: {}, // { voterId: candidateId }
      round2Votes: {}, // { voterId: candidateId }
      runoffCandidates: [], // Top 2 candidates if R1 does not reach 3/4
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
      suspenseTriggeredAt: null
    };
  }

  saveState() {
    try {
      fs.writeFileSync(STATE_BACKUP_PATH, JSON.stringify(this.state, null, 2));
      syncStateToSupabase(this.state).catch(() => {});
    } catch (err) {
      console.error('Error saving state backup:', err);
    }
  }

  loadStateBackup() {
    try {
      if (fs.existsSync(STATE_BACKUP_PATH)) {
        const saved = JSON.parse(fs.readFileSync(STATE_BACKUP_PATH, 'utf-8'));
        this.state = { ...this.state, ...saved };
        console.log('✅ Estado anterior restaurado exitosamente');
      }
    } catch (err) {
      console.error('No se pudo restaurar el estado anterior, iniciando estado limpio:', err);
    }
  }

  broadcastState() {
    this.io.emit('election:state', this.getPublicState());
    this.saveState();
  }

  getPublicState() {
    // Return sanitized state.
    // For voter privacy, do NOT expose who voted for whom while voting is open.
    const r1VoteCount = Object.keys(this.state.round1Votes).length;
    const r2VoteCount = Object.keys(this.state.round2Votes).length;
    
    // Eligible voters count
    const eligibleVoters = this.seminaristas.filter(s => this.state.votingCourses.includes(s.curso));
    const totalEligibleVoters = eligibleVoters.length;

    // List of voter IDs who already cast their vote
    const r1VotedIds = Object.keys(this.state.round1Votes);
    const r2VotedIds = Object.keys(this.state.round2Votes);

    return {
      status: this.state.status,
      eligibleCourses: this.state.eligibleCourses,
      votingCourses: this.state.votingCourses,
      candidates: this.state.candidates,
      totalEligibleVoters,
      r1VoteCount,
      r2VoteCount,
      r1VotedIds,
      r2VotedIds,
      runoffCandidates: this.state.runoffCandidates,
      winner: this.state.winner,
      coordinations: this.state.coordinations,
      coordinators: this.state.coordinators,
      suspenseTriggeredAt: this.state.suspenseTriggeredAt,
      // Results summary (only visible when in RESULTS or COORDINATIONS state)
      resultsR1: ['ROUND_1_RESULTS', 'ROUND_2_VOTING', 'ROUND_2_SUSPENSE', 'ROUND_2_RESULTS', 'COORDINATIONS', 'FINISHED'].includes(this.state.status)
        ? this.calculateResults(this.state.round1Votes, this.state.candidates)
        : null,
      resultsR2: ['ROUND_2_RESULTS', 'COORDINATIONS', 'FINISHED'].includes(this.state.status)
        ? this.calculateResults(this.state.round2Votes, this.state.runoffCandidates)
        : null
    };
  }

  calculateResults(votesMap, candidatesList) {
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

  // --- Actions ---

  updateConfig({ eligibleCourses, votingCourses }) {
    if (this.state.status !== 'CONFIG') return { error: 'No se puede modificar la configuración una vez iniciada la elección' };
    if (eligibleCourses) {
      this.state.eligibleCourses = eligibleCourses;
      // Re-filter candidates
      this.state.candidates = this.seminaristas
        .filter(s => eligibleCourses.includes(s.curso))
        .map(s => {
          const existing = this.state.candidates.find(c => c.id === s.id);
          return existing || {
            id: s.id,
            nombre: s.nombre,
            curso: s.curso,
            foto: s.foto || null,
            votosR1: 0,
            votosR2: 0
          };
        });
    }
    if (votingCourses) {
      this.state.votingCourses = votingCourses;
    }
    this.broadcastState();
    return { success: true };
  }

  updateCandidatePhoto(candidateId, photoUrl) {
    const cand = this.state.candidates.find(c => c.id === candidateId);
    if (cand) {
      cand.foto = photoUrl;
      const sem = this.seminaristas.find(s => s.id === candidateId);
      if (sem) sem.foto = photoUrl;
      this.broadcastState();
      return { success: true };
    }
    return { error: 'Candidato no encontrado' };
  }

  startRound1() {
    this.state.status = 'ROUND_1_VOTING';
    this.state.round1Votes = {};
    this.state.winner = null;
    this.state.runoffCandidates = [];
    this.broadcastState();
    return { success: true };
  }

  triggerSuspense(round = 1) {
    if (round === 1) {
      this.state.status = 'ROUND_1_SUSPENSE';
    } else {
      this.state.status = 'ROUND_2_SUSPENSE';
    }
    this.state.suspenseTriggeredAt = Date.now();
    this.broadcastState();
    return { success: true };
  }

  revealResults(round = 1) {
    if (round === 1) {
      const results = this.calculateResults(this.state.round1Votes, this.state.candidates);
      if (results.winnerDirect) {
        // Winner reached 3/4 threshold!
        this.state.winner = results.winnerDirect;
        this.state.status = 'ROUND_1_RESULTS';
      } else {
        // No one reached 3/4 -> 2nd Round (Runoff) between top 2
        this.state.runoffCandidates = results.tally.slice(0, 2);
        this.state.status = 'ROUND_1_RESULTS';
      }
    } else {
      // Round 2 results
      const results = this.calculateResults(this.state.round2Votes, this.state.runoffCandidates);
      this.state.winner = results.tally[0] || null;
      this.state.status = 'ROUND_2_RESULTS';
    }
    this.broadcastState();
    return { success: true };
  }

  startRound2() {
    if (this.state.runoffCandidates.length < 2) {
      return { error: 'No hay candidatos calificados para segunda vuelta' };
    }
    this.state.status = 'ROUND_2_VOTING';
    this.state.round2Votes = {};
    this.broadcastState();
    return { success: true };
  }

  goToCoordinations() {
    this.state.status = 'COORDINATIONS';
    this.broadcastState();
    return { success: true };
  }

  // Cast vote from seminarist
  castVote({ voterId, cedula, candidateId, round }) {
    // 1. Check voter validity
    const voter = this.seminaristas.find(s => s.id === voterId);
    if (!voter) return { error: 'Seminarista no encontrado en el padrón oficial.' };

    // Validate Cédula (clean formatting: remove dots, spaces, V-)
    const cleanInputCedula = cedula.replace(/[^0-9]/g, '');
    const cleanRecordCedula = voter.cedula.replace(/[^0-9]/g, '');

    if (cleanInputCedula !== cleanRecordCedula) {
      return { error: 'La Cédula de Identidad no coincide con el registro oficial.' };
    }

    // Check if voter's course has right to vote
    if (!this.state.votingCourses.includes(voter.curso)) {
      return { error: 'Tu curso no está habilitado para votar en este proceso.' };
    }

    if (round === 1) {
      if (this.state.status !== 'ROUND_1_VOTING') {
        return { error: 'La votación de primera vuelta no está abierta.' };
      }
      if (this.state.round1Votes[voterId]) {
        return { error: 'Ya has emitido tu voto en esta vuelta.' };
      }
      // Check candidate
      const validCandidate = this.state.candidates.find(c => c.id === candidateId);
      if (!validCandidate) return { error: 'Candidato inválido.' };

      this.state.round1Votes[voterId] = candidateId;
      this.broadcastState();
      recordVoteInSupabase(voterId, 1, candidateId).catch(() => {});
      return { success: true, message: '¡Voto registrado exitosamente!' };
    } else if (round === 2) {
      if (this.state.status !== 'ROUND_2_VOTING') {
        return { error: 'La segunda vuelta de votación no está abierta.' };
      }
      if (this.state.round2Votes[voterId]) {
        return { error: 'Ya has emitido tu voto en esta segunda vuelta.' };
      }
      // Check candidate is in runoff
      const validCandidate = this.state.runoffCandidates.find(c => c.id === candidateId);
      if (!validCandidate) return { error: 'Candidato no válido para segunda vuelta.' };

      this.state.round2Votes[voterId] = candidateId;
      this.broadcastState();
      recordVoteInSupabase(voterId, 2, candidateId).catch(() => {});
      return { success: true, message: '¡Voto de segunda vuelta registrado exitosamente!' };
    }

    return { error: 'Vuelta electoral no válida.' };
  }

  // Coordination assignment
  assignSeminaristaToCoordination(seminaristaId, coordinationKey) {
    const validCoords = ['liturgia', 'cultura', 'cocina', 'servicios_generales'];
    if (!validCoords.includes(coordinationKey) && coordinationKey !== 'unassigned') {
      return { error: 'Coordinación inválida' };
    }

    // Remove from all coordinations first
    validCoords.forEach(key => {
      this.state.coordinations[key] = this.state.coordinations[key].filter(id => id !== seminaristaId);
      if (this.state.coordinators[key] === seminaristaId) {
        this.state.coordinators[key] = null;
      }
    });

    // If assigning to a specific coordination
    if (coordinationKey !== 'unassigned') {
      this.state.coordinations[coordinationKey].push(seminaristaId);
    }

    this.broadcastState();
    return { success: true };
  }

  setAreaCoordinator(coordinationKey, seminaristaId) {
    const validCoords = ['liturgia', 'cultura', 'cocina', 'servicios_generales'];
    if (!validCoords.includes(coordinationKey)) return { error: 'Coordinación inválida' };

    // Make sure seminarista is in that coordination
    if (!this.state.coordinations[coordinationKey].includes(seminaristaId)) {
      this.assignSeminaristaToCoordination(seminaristaId, coordinationKey);
    }

    this.state.coordinators[coordinationKey] = seminaristaId;
    this.broadcastState();
    return { success: true };
  }

  resetElection() {
    this.state = this.getInitialState();
    if (fs.existsSync(STATE_BACKUP_PATH)) {
      fs.unlinkSync(STATE_BACKUP_PATH);
    }
    this.broadcastState();
    return { success: true };
  }
}
