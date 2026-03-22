import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  return sendJson(res, 200, {
    ok: true,
    service: 'stockbet-api',
    time: new Date().toISOString(),
  });
}
