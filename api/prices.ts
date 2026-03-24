import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendJson, handleOptions } from '../lib/server/cors';

// Alpha Vantage free tier: 25 req/day. We use Yahoo Finance as primary (no key needed server-side).
// Falls back to simulated prices if both fail.

const BASE_PRICES: Record<string, number> = {
  AAPL: 198.45, TSLA: 248.92, NVDA: 875.3, MSFT: 415.6,
  AMZN: 185.2, GOOGL: 155.72, META: 505.3,
  'RELIANCE.NS': 2450.75, 'TCS.NS': 3890.4, 'INFY.NS': 1520.3, 'HDFCBANK.NS': 1680.5,
  '0700.HK': 378.4, '9988.HK': 82.15, '0005.HK': 65.3,
};

function simPrice(symbol: string): number {
  const base = BASE_PRICES[symbol] ?? 100;
  const drift = (Math.random() - 0.48) * base * 0.008;
  return Math.round((base + drift) * 100) / 100;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return handleOptions(res);
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const symbolsParam = (req.query.symbols as string) || '';
  const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);

  if (!symbols.length) return sendJson(res, 400, { error: 'symbols param required' });

  // Try Yahoo Finance (no API key needed, works server-side)
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (r.ok) {
      const json = await r.json();
      const quotes: Record<string, unknown>[] = json?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        const prices: Record<string, number> = {};
        for (const q of quotes) {
          prices[q.symbol as string] = Number(q.regularMarketPrice) || simPrice(q.symbol as string);
        }
        // Fill any missing symbols with simulated
        for (const s of symbols) {
          if (!prices[s]) prices[s] = simPrice(s);
        }
        return sendJson(res, 200, { prices, source: 'yahoo' });
      }
    }
  } catch {
    // fall through
  }

  // Fallback: simulated
  const prices: Record<string, number> = {};
  for (const s of symbols) prices[s] = simPrice(s);
  return sendJson(res, 200, { prices, source: 'simulated' });
}
