import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElectionManager } from '../electionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock socket.io
const mockIo = {
  emit: () => {}
};

console.log('🧪 INICIANDO PRUEBAS UNITARIAS DE REGLAS ELECTORALES...\n');

// 1. Verificación de Padrón y Cédulas Corregidas
const seminaristas = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'seminaristas.json'), 'utf-8'));
console.log(`✅ Total de seminaristas en padrón: ${seminaristas.length}`);
assert.strictEqual(seminaristas.length, 51, 'El padrón debe tener exactamente 51 seminaristas');

const angelBaez = seminaristas.find(s => s.nombre.includes('BÁEZ CARIDAD'));
assert.ok(angelBaez, 'Ángel Báez debe existir');
assert.strictEqual(angelBaez.cedula, 'V-33.124.925', 'La cédula de Ángel Báez debe ser V-33.124.925');
console.log('✅ Ángel David Báez Caridad verificado: V-33.124.925');

const joseMiguel = seminaristas.find(s => s.nombre.includes('SIERRA NAVA'));
assert.ok(joseMiguel, 'José Miguel Sierra Nava debe existir');
assert.strictEqual(joseMiguel.cedula, 'V-33.597.365', 'La cédula de José Miguel Sierra debe ser V-33.597.365');
console.log('✅ José Miguel Sierra Nava verificado: V-33.597.365');

const miguelMarquez = seminaristas.find(s => s.nombre.includes('MÁRQUEZ BARRETO'));
assert.strictEqual(miguelMarquez, undefined, 'Miguel Márquez debe estar excluido');
console.log('✅ Miguel Rafael Márquez Barreto correctamente excluido');

// 2. Prueba de Regla de 3/4 (Victoria Directa en 1ª Vuelta)
console.log('\n--- Probando Victoria Directa por 3/4 (75%) ---');
const em1 = new ElectionManager(mockIo);
em1.startRound1();

// Simular 4 candidatos
const cand1 = em1.state.candidates[0];
const cand2 = em1.state.candidates[1];

// Emitir 12 votos: 9 para cand1 (75%) y 3 para cand2 (25%)
const voters = em1.seminaristas.slice(0, 12);
voters.forEach((v, idx) => {
  const targetCand = idx < 9 ? cand1.id : cand2.id;
  const res = em1.castVote({
    voterId: v.id,
    cedula: v.cedula,
    candidateId: targetCand,
    round: 1
  });
  assert.ok(res.success, `Voto ${idx+1} debe registrarse`);
});

assert.strictEqual(Object.keys(em1.state.round1Votes).length, 12);
em1.revealResults(1);

assert.ok(em1.state.winner, 'Debe haber un ganador proclamado directamente');
assert.strictEqual(em1.state.winner.id, cand1.id, 'Cand1 debe ser el ganador por tener 75%');
assert.strictEqual(em1.state.winner.percentage, 75);
console.log(`✅ Ganador directo en 1ª Vuelta con 75% (3/4): ${em1.state.winner.nombre} (${em1.state.winner.votes} de 12 votos)`);

// 3. Prueba de Balotaje (Segunda Vuelta cuando nadie alcanza el 75%)
console.log('\n--- Probando Activación de Balotaje (Segunda Vuelta) ---');
const em2 = new ElectionManager(mockIo);
em2.startRound1();

const cA = em2.state.candidates[0];
const cB = em2.state.candidates[1];
const cC = em2.state.candidates[2];

// Emitir 10 votos: 5 para cA (50%), 3 para cB (30%), 2 para cC (20%)
const votersR1 = em2.seminaristas.slice(0, 10);
votersR1.forEach((v, idx) => {
  const target = idx < 5 ? cA.id : (idx < 8 ? cB.id : cC.id);
  em2.castVote({
    voterId: v.id,
    cedula: v.cedula,
    candidateId: target,
    round: 1
  });
});

em2.revealResults(1);
assert.strictEqual(em2.state.winner, null, 'No debe haber ganador directo');
assert.strictEqual(em2.state.runoffCandidates.length, 2, 'Deben clasificar exactamente 2 para balotaje');
assert.strictEqual(em2.state.runoffCandidates[0].id, cA.id);
assert.strictEqual(em2.state.runoffCandidates[1].id, cB.id);
console.log(`✅ Balotaje activado correctamente entre los dos más votados: ${cA.nombre} (5 votos) vs ${cB.nombre} (3 votos)`);

// Iniciar Segunda Vuelta
em2.startRound2();
assert.strictEqual(em2.state.status, 'ROUND_2_VOTING');

// Emitir votos en Segunda Vuelta: cB remonta con 6 votos y cA saca 4 votos
votersR1.forEach((v, idx) => {
  const target = idx < 6 ? cB.id : cA.id;
  const res = em2.castVote({
    voterId: v.id,
    cedula: v.cedula,
    candidateId: target,
    round: 2
  });
  assert.ok(res.success, `Voto de 2ª vuelta debe registrarse`);
});

em2.revealResults(2);
assert.ok(em2.state.winner, 'Debe haber un ganador de balotaje');
assert.strictEqual(em2.state.winner.id, cB.id, 'cB debe ser el ganador de la segunda vuelta');
console.log(`✅ Ganador definitivo de Segunda Vuelta: ${em2.state.winner.nombre} (${em2.state.winner.votes} votos)`);

// 4. Prueba del Módulo de 4 Coordinaciones Pastorales
console.log('\n--- Probando Asignación de Coordinaciones ---');
em2.goToCoordinations();
assert.strictEqual(em2.state.status, 'COORDINATIONS');

const semA = em2.seminaristas[0];
const semB = em2.seminaristas[1];

// Asignar semA a liturgia
em2.assignSeminaristaToCoordination(semA.id, 'liturgia');
assert.ok(em2.state.coordinations.liturgia.includes(semA.id));

// Nombrar a semA coordinador de liturgia
em2.setAreaCoordinator('liturgia', semA.id);
assert.strictEqual(em2.state.coordinators.liturgia, semA.id);

// Mover a semA a cocina
em2.assignSeminaristaToCoordination(semA.id, 'cocina');
assert.ok(!em2.state.coordinations.liturgia.includes(semA.id), 'Debe salir de liturgia');
assert.ok(em2.state.coordinations.cocina.includes(semA.id), 'Debe estar en cocina');
assert.strictEqual(em2.state.coordinators.liturgia, null, 'Coordinador anterior debe limpiarse');

console.log('✅ Asignación y cambio dinámico entre coordinaciones probado exitosamente');

console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS PASARON AL 100%!');
