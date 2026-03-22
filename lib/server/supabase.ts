import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

export function createUserClient(authHeader: string | undefined): SupabaseClient | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const jwt = authHeader.slice(7).trim();
  if (!jwt) return null;
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

export function createServiceClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
