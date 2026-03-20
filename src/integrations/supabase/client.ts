import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Warn in dev if key looks wrong (sb_publishable_ prefix is not a valid JWT anon key)
if (import.meta.env.DEV && (!SUPABASE_KEY || SUPABASE_KEY.startsWith('sb_publishable_'))) {
  console.warn(
    '[StockBet] Invalid or missing Supabase anon key.\n' +
    'Go to https://supabase.com/dashboard → your project → Settings → API\n' +
    'Copy the "anon public" key (starts with eyJhbGci...) and set it as:\n' +
    'VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci... in your .env file, then restart.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
