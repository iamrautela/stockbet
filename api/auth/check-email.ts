import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../../lib/server/cors';
import { createServiceClient } from '../../lib/server/supabase';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const email = String(body.email || '').trim();
    if (!email || !isValidEmail(email)) {
      return sendJson(res, 400, { error: 'Valid email required' });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc('is_registered_email', {
      email_check: email,
    });

    if (error) {
      console.error('is_registered_email rpc:', error.message);
      return sendJson(res, 503, {
        error: 'Email check unavailable. Apply migration 20260322120000_auth_email_check.sql or try again.',
        code: 'RPC_UNAVAILABLE',
      });
    }

    return sendJson(res, 200, { registered: Boolean(data) });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}
