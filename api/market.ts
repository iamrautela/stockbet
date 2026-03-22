import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';
import {
  defaultSymbolsForMarket,
  fetchYahooQuotes,
} from '../lib/server/market';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    let market = 'US';
    let symbols: string[] | undefined;

    if (req.method === 'GET') {
      const m = String((req.query.market as string) || 'US').toUpperCase();
      market = m === 'IN' ? 'IN' : m === 'HK' ? 'HK' : 'US';
      const custom = req.query.symbols as string | undefined;
      symbols = custom ? custom.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      market = body.market || 'US';
      symbols = Array.isArray(body.symbols) ? body.symbols : undefined;
    }

    const list = symbols?.length ? symbols : defaultSymbolsForMarket(market);
    const { stocks, source } = await fetchYahooQuotes(list, market);
    return sendJson(res, 200, { stocks, source, market });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}
