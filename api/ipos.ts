import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';
import { createServiceClient } from '../lib/server/supabase';

/** Public IPO list (server-side only; uses service role to bypass RLS for read). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('ipos')
      .select('*')
      .order('listing_date', { ascending: true });
    if (error) throw error;
    return sendJson(res, 200, { ipos: data || [] });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}
