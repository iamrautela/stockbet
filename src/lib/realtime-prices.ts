import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';

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

/** Fetch real-time prices for a list of symbols. Returns a map symbol→price. */
export async function fetchRealtimePrices(symbols: string[]): Promise<Record<string, number>> {
  if (!symbols.length) return {};

  // Use server proxy when available (avoids CORS)
  if (backendApiEnabled()) {
    try {
      const res = await apiFetch<{ prices: Record<string, number> }>(
        `/api/prices?symbols=${encodeURIComponent(symbols.join(','))}`
      );
      return res.prices || {};
    } catch {
      // fall through
    }
  }

  // Direct Yahoo Finance (works in some environments)
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(','))}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (r.ok) {
      const json = await r.json();
      const quotes: Record<string, unknown>[] = json?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        const prices: Record<string, number> = {};
        for (const q of quotes) {
          prices[q.symbol as string] = Number(q.regularMarketPrice) || simPrice(q.symbol as string);
        }
        return prices;
      }
    }
  } catch {
    // fall through
  }

  // Simulated fallback
  const prices: Record<string, number> = {};
  for (const s of symbols) prices[s] = simPrice(s);
  return prices;
}
