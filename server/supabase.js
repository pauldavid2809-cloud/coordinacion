import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let isConfigured = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('tu-proyecto')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: {
        headers: { 'x-application-name': 'coordinaciones-seminario' }
      }
    });
    isConfigured = true;
    console.log(`📡 Cliente Supabase inicializado [${SUPABASE_URL}]`);
  } catch (err) {
    console.warn('⚠️ No se pudo inicializar cliente Supabase:', err.message);
  }
} else {
  console.log('ℹ️ Supabase no configurado o usando valores por defecto. Operando en modo local.');
}

export { supabase, isConfigured };

/**
 * Sincroniza el padrón de seminaristas con la tabla 'coord_seminaristas'
 */
export async function syncSeminaristasToSupabase(seminaristas = []) {
  if (!isConfigured || !supabase || seminaristas.length === 0) return false;
  try {
    const payload = seminaristas.map(s => ({
      id: s.id,
      nombre: s.nombre,
      curso: s.curso,
      cedula: s.cedula,
      foto: s.foto || null,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('coord_seminaristas')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Error al sincronizar seminaristas a Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('⚠️ Excepción al sincronizar seminaristas a Supabase:', err.message);
    return false;
  }
}

/**
 * Sincroniza el estado electoral completo en 'coord_election_state'
 */
export async function syncStateToSupabase(state) {
  if (!isConfigured || !supabase || !state) return false;
  try {
    const record = {
      id: 'current',
      status: state.status,
      eligible_courses: state.eligibleCourses,
      voting_courses: state.votingCourses,
      candidates: state.candidates,
      round1_votes: state.round1Votes,
      round2_votes: state.round2Votes,
      runoff_candidates: state.runoffCandidates,
      winner: state.winner,
      coordinations: state.coordinations,
      coordinators: state.coordinators,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('coord_election_state')
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Error al sincronizar estado a Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('⚠️ Excepción al sincronizar estado a Supabase:', err.message);
    return false;
  }
}

/**
 * Registra un voto individual en la tabla 'coord_votes'
 */
export async function recordVoteInSupabase(voterId, round, candidateId) {
  if (!isConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('coord_votes')
      .upsert({
        voter_id: voterId,
        round,
        candidate_id: candidateId,
        created_at: new Date().toISOString()
      }, { onConflict: 'voter_id,round' });

    if (error) {
      console.warn('⚠️ Error al registrar voto en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('⚠️ Excepción al registrar voto en Supabase:', err.message);
    return false;
  }
}

/**
 * Registra un evento de auditoría en 'coord_audit_log'
 */
export async function logAuditEvent(eventType, details = {}) {
  if (!isConfigured || !supabase) return false;
  try {
    await supabase
      .from('coord_audit_log')
      .insert({
        event_type: eventType,
        details,
        created_at: new Date().toISOString()
      });
    return true;
  } catch (err) {
    return false;
  }
}
