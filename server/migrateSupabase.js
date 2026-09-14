import fs from 'fs';
import path from 'path';

// Cargar .env si existe de manera nativa
if (fs.existsSync(path.resolve('.env'))) {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const SUPABASE_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF || 'zanbuungsgmsdirhqxcg';

async function runQuery(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

async function migrate() {
  console.log('1. Creando tablas seminaristas y solicitudes en Supabase PostgreSQL...');

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS public.seminaristas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      nombre_completo TEXT NOT NULL,
      cedula TEXT NOT NULL UNIQUE,
      telefono TEXT,
      curso TEXT,
      etapa TEXT,
      diocesis TEXT,
      foto TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.solicitudes (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      seminarista_id TEXT REFERENCES public.seminaristas(id) ON DELETE SET NULL,
      seminarista_nombre TEXT,
      seminarista_cedula TEXT,
      seminarista_curso TEXT,
      seminarista_diocesis TEXT,
      
      tipo_permiso TEXT,
      motivo TEXT,
      destino TEXT,
      fecha_salida TEXT,
      fecha_retorno TEXT,
      
      area TEXT,
      urgencia TEXT,
      descripcion TEXT,
      
      titulo TEXT,
      dimension TEXT,
      justificacion TEXT,
      detalles TEXT,
      
      estado TEXT DEFAULT 'pendiente',
      observacion_rector TEXT DEFAULT '',
      fecha_resolucion TIMESTAMPTZ,
      fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.seminaristas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Lectura abierta seminaristas" ON public.seminaristas;
    CREATE POLICY "Lectura abierta seminaristas" ON public.seminaristas FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Escritura abierta seminaristas" ON public.seminaristas;
    CREATE POLICY "Escritura abierta seminaristas" ON public.seminaristas FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Lectura abierta solicitudes" ON public.solicitudes;
    CREATE POLICY "Lectura abierta solicitudes" ON public.solicitudes FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Escritura abierta solicitudes" ON public.solicitudes;
    CREATE POLICY "Escritura abierta solicitudes" ON public.solicitudes FOR ALL USING (true) WITH CHECK (true);
  `;

  await runQuery(schemaSql);
  console.log('✅ Tablas y políticas RLS creadas con éxito.');

  console.log('2. Habilitando Realtime en las tablas...');
  const realtimeSql = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'solicitudes'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.solicitudes;
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'seminaristas'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.seminaristas;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Publicacion realtime ya existe o configurada: %', SQLERRM;
    END $$;
  `;
  await runQuery(realtimeSql);
  console.log('✅ Realtime configurado.');

  console.log('3. Insertando los 38 seminaristas del padrón oficial...');
  const seminaristasJson = JSON.parse(
    fs.readFileSync(path.resolve('src/data/seminaristas.json'), 'utf8')
  );

  for (const s of seminaristasJson) {
    const insertSql = `
      INSERT INTO public.seminaristas (id, nombre, nombre_completo, cedula, telefono, curso, etapa, diocesis, foto)
      VALUES (
        '${s.id}',
        '${s.nombre.replace(/'/g, "''")}',
        '${s.nombreCompleto.replace(/'/g, "''")}',
        '${s.cedula.replace(/'/g, "''")}',
        ${s.telefono ? `'${s.telefono.replace(/'/g, "''")}'` : 'NULL'},
        '${s.curso.replace(/'/g, "''")}',
        '${s.etapa.replace(/'/g, "''")}',
        '${s.diocesis.replace(/'/g, "''")}',
        ${s.foto ? `'${s.foto}'` : 'NULL'}
      )
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        nombre_completo = EXCLUDED.nombre_completo,
        cedula = EXCLUDED.cedula,
        telefono = EXCLUDED.telefono,
        curso = EXCLUDED.curso,
        etapa = EXCLUDED.etapa,
        diocesis = EXCLUDED.diocesis;
    `;
    await runQuery(insertSql);
  }
  console.log(`✅ ${seminaristasJson.length} seminaristas insertados/sincronizados en Supabase.`);

  const countRes = await runQuery('SELECT COUNT(*) as total FROM public.seminaristas;');
  console.log('Total de seminaristas en BD:', countRes[0]?.total);
}

migrate().catch(err => {
  console.error('Error en la migración:', err);
  process.exit(1);
});
