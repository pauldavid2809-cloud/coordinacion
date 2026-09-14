import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://zanbuungsgmsdirhqxcg.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbmJ1dW5nc2dtc2RpcmhxeGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODE3NzksImV4cCI6MjA5OTU1Nzc3OX0.rlADmpdMHnMihyFrEBMa6ZYmQntqYlb30HgCpGciXPo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
