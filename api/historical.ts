import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';

/** Yahoo Finance chart API — daily closes for backtesting (server-side, no browser CORS). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const symbol = String(req.query.symbol || '').trim();
  const range = String(req.query.range || '1y').trim();
  if (!symbol) return sendJson(res, 400, { error: 'symbol query required' });

  const allowedRanges = ['3mo', '6mo', '1y', '2y', '5y'];
  const r = allowedRanges.includes(range) ? range : '1y';

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=${r}&interval=1d`;

  try {
    const y = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!y.ok) {
      return sendJson(res, 502, { error: `Upstream ${y.status}`, closes: [] });
    }

    const json = await y.json();
    const result = json?.chart?.result?.[0];
    if (!result) {
      return sendJson(res, 200, { symbol, range: r, closes: [], timestamps: [], source: 'yahoo' });
    }

    const quote = result.indicators?.quote?.[0];
    const closes: number[] = (quote?.close || []).filter(
      (c: number | null) => c != null && Number.isFinite(c)
    ) as number[];
    const ts: number[] = (result.timestamp || []).slice(0, closes.length);

    return sendJson(res, 200, {
      symbol: result.meta?.symbol || symbol,
      range: r,
      currency: result.meta?.currency,
      closes,
      timestamps: ts,
      source: 'yahoo',
    });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message, closes: [] });
  }
}
