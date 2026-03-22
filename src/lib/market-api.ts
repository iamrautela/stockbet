import { mockStocks } from '@/lib/mock-data';
import { apiFetch, backendApiEnabled } from '@/lib/backend-fetch';

export interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  market: string;
  sector: string;
}

const MARKET_SYMBOLS: Record<string, string[]> = {
  US: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'],
  IN: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'],
  HK: ['0700.HK', '9988.HK', '0005.HK'],
};

// Simulate live price movement on top of mock data
function simulateLive(stocks: typeof mockStocks): LiveStock[] {
  return stocks.map((s) => {
    const drift = (Math.random() - 0.48) * s.price * 0.005;
    const price = Math.round((s.price + drift) * 100) / 100;
    const change = Math.round((s.change + drift) * 100) / 100;
    const changePercent = Math.round((change / (price - change)) * 10000) / 100;
    return {
      ...s,
      price,
      change,
      changePercent,
      dayHigh: Math.max(s.dayHigh, price),
      dayLow: Math.min(s.dayLow, price),
    };
  });
}

export async function fetchMarketData(market: string): Promise<LiveStock[]> {
  if (backendApiEnabled()) {
    try {
      const res = await apiFetch<{ stocks: LiveStock[] }>(
        `/api/market?market=${encodeURIComponent(market)}`
      );
      if (res.stocks?.length) return res.stocks;
    } catch {
      // fall through to client-side paths below
    }
  }

  const symbols = MARKET_SYMBOLS[market] || MARKET_SYMBOLS.US;

  // Try Yahoo Finance via a CORS proxy
  try {
    const symbolsParam = symbols.join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolsParam)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,regularMarketDayHigh,regularMarketDayLow,shortName,sector`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      const quotes: any[] = json?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        return quotes.map((q) => ({
          symbol: q.symbol,
          name: q.shortName || q.symbol,
          price: q.regularMarketPrice ?? 0,
          change: q.regularMarketChange ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          volume: formatVol(q.regularMarketVolume ?? 0),
          marketCap: formatCap(q.marketCap ?? 0),
          dayHigh: q.regularMarketDayHigh ?? 0,
          dayLow: q.regularMarketDayLow ?? 0,
          market,
          sector: q.sector || 'Unknown',
        }));
      }
    }
  } catch {
    // fall through to mock
  }

  // Fallback: simulated live data from mock
  const filtered = mockStocks.filter((s) => symbols.includes(s.symbol));
  const base = filtered.length > 0 ? filtered : mockStocks.filter((s) => s.market === market);
  return simulateLive(base.length > 0 ? base : mockStocks.slice(0, 7));
}

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const stocks = await fetchMarketData('US');
    return stocks.find((s) => s.symbol === symbol)?.price ?? null;
  } catch {
    return null;
  }
}

function formatVol(v: number) {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return String(v);
}

function formatCap(c: number) {
  if (c >= 1e12) return (c / 1e12).toFixed(2) + 'T';
  if (c >= 1e9) return (c / 1e9).toFixed(1) + 'B';
  if (c >= 1e6) return (c / 1e6).toFixed(1) + 'M';
  return String(c);
}

export { MARKET_SYMBOLS };
