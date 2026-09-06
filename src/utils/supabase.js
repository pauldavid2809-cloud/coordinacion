import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nvrdcamlzjfojbvbyzp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cmRjYW1sempmb2pidnpieXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTM5NzMsImV4cCI6MjEwMzQyOTk3M30.vKcxsqQjxMkg8wjBkBwiaUKOigaGd3sq7n-qvA5c9a8';

let supabase = null;
let isConfigured = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('tu-proyecto')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: {
        headers: { 'x-application-name': 'coordinaciones-seminario-client' }
      }
    });
    isConfigured = true;
  } catch (err) {
    console.warn('No se pudo inicializar Supabase client en frontend:', err);
  }
}

export { supabase, isConfigured };
