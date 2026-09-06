-- ====================================================================
-- SISTEMA DE ELECCIÓN Y COORDINACIONES PASTORALES
-- Seminario Mayor Santo Tomás de Aquino (Arquidiócesis de Maracaibo)
-- ====================================================================
-- Espacio de nombres aislado: Todas las tablas usan el prefijo "coord_"
-- para evitar CUALQUIER tipo de colisión con otras aplicaciones
-- (como Oli's Burger, ByteBridge, etc.) en este mismo proyecto de Supabase.
-- ====================================================================

-- 1. TABLA DE SEMINARISTAS OFICIALES (coord_seminaristas)
CREATE TABLE IF NOT EXISTS public.coord_seminaristas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  curso TEXT NOT NULL,
  cedula TEXT NOT NULL,
  foto TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE ESTADO ELECTORAL EN TIEMPO REAL (coord_election_state)
CREATE TABLE IF NOT EXISTS public.coord_election_state (
  id TEXT PRIMARY KEY DEFAULT 'current',
  status TEXT NOT NULL DEFAULT 'CONFIG',
  eligible_courses JSONB NOT NULL DEFAULT '["2° de Teología", "3° de Teología"]'::jsonb,
  voting_courses JSONB NOT NULL DEFAULT '["1° de Filosofía","2° de Filosofía","3° de Filosofía","1° de Teología","2° de Teología","3° de Teología","4° de Teología"]'::jsonb,
  candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  round1_votes JSONB NOT NULL DEFAULT '{}'::jsonb,
  round2_votes JSONB NOT NULL DEFAULT '{}'::jsonb,
  runoff_candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner JSONB DEFAULT NULL,
  coordinations JSONB NOT NULL DEFAULT '{"liturgia":[],"cultura":[],"cocina":[],"servicios_generales":[]}'::jsonb,
  coordinators JSONB NOT NULL DEFAULT '{"liturgia":null,"cultura":null,"cocina":null,"servicios_generales":null}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE SUFRAGIOS ANÓNIMOS / ESCRUTINIO (coord_votes)
CREATE TABLE IF NOT EXISTS public.coord_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id TEXT NOT NULL,
  round INT NOT NULL CHECK (round IN (1, 2)),
  candidate_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (voter_id, round)
);

-- 4. TABLA DE AUDITORÍA Y TRAZABILIDAD (coord_audit_log)
CREATE TABLE IF NOT EXISTS public.coord_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- POLÍTICAS DE ACCESO RLS (Row Level Security)
-- ====================================================================
ALTER TABLE public.coord_seminaristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coord_election_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coord_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coord_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Anon / Authenticated)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_seminaristas_read_all') THEN
    CREATE POLICY coord_seminaristas_read_all ON public.coord_seminaristas FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_election_state_read_all') THEN
    CREATE POLICY coord_election_state_read_all ON public.coord_election_state FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_votes_read_all') THEN
    CREATE POLICY coord_votes_read_all ON public.coord_votes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_audit_log_read_all') THEN
    CREATE POLICY coord_audit_log_read_all ON public.coord_audit_log FOR SELECT USING (true);
  END IF;
END $$;

-- Políticas de Escritura y Modificación para Sincronización
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_seminaristas_write_all') THEN
    CREATE POLICY coord_seminaristas_write_all ON public.coord_seminaristas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_election_state_write_all') THEN
    CREATE POLICY coord_election_state_write_all ON public.coord_election_state FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_votes_write_all') THEN
    CREATE POLICY coord_votes_write_all ON public.coord_votes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'coord_audit_log_write_all') THEN
    CREATE POLICY coord_audit_log_write_all ON public.coord_audit_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ====================================================================
-- DATOS SEMILLA: 38 SEMINARISTAS OFICIALES (Sin Propedéutas)
-- ====================================================================
INSERT INTO public.coord_seminaristas (id, nombre, curso, cedula) VALUES
  ('s_1', 'Ángel Báez', '1° de Filosofía', '33.124.925'),
  ('s_2', 'José Bermúdez', '1° de Filosofía', '32.186.273'),
  ('s_3', 'Edwin Bermúdez', '1° de Filosofía', '32.969.832'),
  ('s_4', 'Lisandro Castellano', '1° de Filosofía', '32.556.763'),
  ('s_5', 'Roberth García', '1° de Filosofía', '32.923.479'),
  ('s_6', 'Isaac Pérez', '1° de Filosofía', '32.793.856'),
  ('s_7', 'Samuel Pérez', '1° de Filosofía', '32.651.986'),
  ('s_8', 'Alfenyer Fernández', '2° de Filosofía', '31.391.890'),
  ('s_9', 'Gregory García', '2° de Filosofía', '31.258.857'),
  ('s_10', 'Ranses Mercado', '2° de Filosofía', '32.062.246'),
  ('s_11', 'Luis Polanco', '2° de Filosofía', '30.222.185'),
  ('s_12', 'Alejandro Rubio', '2° de Filosofía', '31.144.180'),
  ('s_13', 'Yorvi Sierra', '2° de Filosofía', '32.190.589'),
  ('s_14', 'José Miguel Sierra', '2° de Filosofía', '33.597.365'),
  ('s_15', 'Osmán Vargas', '2° de Filosofía', '31.602.834'),
  ('s_16', 'Julio Yajure', '2° de Filosofía', '31.157.062'),
  ('s_17', 'José Castillo', '3° de Filosofía', '30.932.189'),
  ('s_18', 'Jorge Reyes', '3° de Filosofía', '31.425.263'),
  ('s_19', 'Mario Soto', '3° de Filosofía', '31.792.054'),
  ('s_20', 'José Acosta', '1° de Teología', '29.749.680'),
  ('s_21', 'Dany Araujo', '1° de Teología', '27.422.379'),
  ('s_22', 'Luis Benítez', '1° de Teología', '30.730.086'),
  ('s_23', 'Yorvi Chirino', '1° de Teología', '31.325.321'),
  ('s_24', 'Juan Higuera', '1° de Teología', '30.134.425'),
  ('s_25', 'David Paz', '1° de Teología', '30.654.409'),
  ('s_26', 'Yorby Suárez', '1° de Teología', '31.144.606'),
  ('s_27', 'Cesar Petit', '2° de Teología', '30.612.339'),
  ('s_28', 'Andrés Araviche', '3° de Teología', '28.169.186'),
  ('s_29', 'Jossue Hernández', '3° de Teología', '28.455.517'),
  ('s_30', 'Nixon Torrealba', '3° de Teología', '28.435.539'),
  ('s_31', 'Rixio García', '4° de Teología', '27.604.428'),
  ('s_32', 'Alirio González', '4° de Teología', '27.311.233'),
  ('s_33', 'Carlos Morán', '4° de Teología', '26.837.989'),
  ('s_34', 'José Oria', '4° de Teología', '29.702.404'),
  ('s_35', 'Santiago Parra', '4° de Teología', '28.489.176'),
  ('s_36', 'Yorbis Rondón', '4° de Teología', '28.411.393'),
  ('s_37', 'Eduardo Timaure', '4° de Teología', '28.093.076'),
  ('s_38', 'Jholbert Villasmil', '4° de Teología', '27.957.514')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  curso = EXCLUDED.curso,
  cedula = EXCLUDED.cedula;

-- ====================================================================
-- ESTADO INICIAL
-- ====================================================================
INSERT INTO public.coord_election_state (id, status)
VALUES ('current', 'CONFIG')
ON CONFLICT (id) DO NOTHING;
