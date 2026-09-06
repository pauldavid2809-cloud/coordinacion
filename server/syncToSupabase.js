import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  isConfigured, 
  supabase, 
  syncSeminaristasToSupabase, 
  syncStateToSupabase, 
  logAuditEvent 
} from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEMINARISTAS_PATH = path.join(__dirname, 'data', 'seminaristas.json');
const STATE_PATH = path.join(__dirname, 'data', 'state.json');

async function main() {
  console.log('======================================================');
  console.log('🚀 SINCRONIZACIÓN SUPABASE — COORDINACIONES SEMINARIO');
  console.log('======================================================');

  if (!isConfigured || !supabase) {
    console.error('❌ Supabase no está configurado o faltan credenciales en .env');
    console.log('Por favor verifica SUPABASE_URL y SUPABASE_ANON_KEY en tu archivo .env');
    process.exit(1);
  }

  // 1. Cargar datos locales
  console.log('📂 Leyendo datos locales...');
  const seminaristas = JSON.parse(fs.readFileSync(SEMINARISTAS_PATH, 'utf-8'));
  console.log(`✅ ${seminaristas.length} seminaristas cargados.`);

  let state = null;
  if (fs.existsSync(STATE_PATH)) {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
    console.log(`✅ Estado actual cargado (Fase: ${state.status}).`);
  }

  // 2. Probar conexión básica
  console.log('📡 Verificando conexión con Supabase...');
  try {
    const { count, error } = await supabase
      .from('coord_seminaristas')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.warn('⚠️ La tabla "coord_seminaristas" aún no existe en Supabase.');
        console.log('👉 Ejecuta el script SQL ubicado en "supabase/schema.sql" en el SQL Editor de tu Dashboard de Supabase.');
      } else {
        console.warn('⚠️ Respuesta de Supabase:', error.message);
      }
    } else {
      console.log(`✅ Conexión exitosa. Registros actuales en coord_seminaristas: ${count || 0}`);
    }
  } catch (err) {
    console.warn('⚠️ No se pudo verificar la tabla:', err.message);
  }

  // 3. Subir seminaristas
  console.log(`\n⬆️ Sincronizando ${seminaristas.length} seminaristas a la tabla "coord_seminaristas"...`);
  const semOk = await syncSeminaristasToSupabase(seminaristas);
  if (semOk) {
    console.log('✅ Seminaristas subidos exitosamente.');
  } else {
    console.log('ℹ️ Si la tabla no existe aún, ejecuta primero "supabase/schema.sql" en Supabase.');
  }

  // 4. Subir estado
  if (state) {
    console.log('\n⬆️ Sincronizando estado electoral a "coord_election_state"...');
    const stateOk = await syncStateToSupabase(state);
    if (stateOk) {
      console.log('✅ Estado electoral subido exitosamente.');
    }
  }

  await logAuditEvent('MANUAL_SYNC_TRIGGERED', {
    seminaristasCount: seminaristas.length,
    timestamp: new Date().toISOString()
  });

  console.log('\n======================================================');
  console.log('✨ Proceso de sincronización finalizado.');
  console.log('======================================================');
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
