export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export function getSupabaseUrl(): string {
  return requireEnv('SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return requireEnv('SUPABASE_ANON_KEY');
}

export function getSupabaseServiceRoleKey(): string {
  return requireEnv('SUPABASE_SERVICE_ROLE_KEY');
}

export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}
