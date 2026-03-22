export const MARKET_SYMBOLS: Record<string, string[]> = {
  US: ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'],
  IN: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'],
  HK: ['0700.HK', '9988.HK', '0005.HK'],
};

export type QuoteStock = {
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
};

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

const BASE_SIM: Record<string, { price: number; name: string; sector: string }> = {
  AAPL: { price: 198.45, name: 'Apple Inc.', sector: 'Technology' },
  TSLA: { price: 248.92, name: 'Tesla Inc.', sector: 'Automotive' },
  NVDA: { price: 875.3, name: 'NVIDIA Corp.', sector: 'Technology' },
  MSFT: { price: 415.6, name: 'Microsoft Corp.', sector: 'Technology' },
  AMZN: { price: 185.2, name: 'Amazon.com Inc.', sector: 'Consumer' },
  GOOGL: { price: 155.72, name: 'Alphabet Inc.', sector: 'Technology' },
  META: { price: 505.3, name: 'Meta Platforms', sector: 'Technology' },
  'RELIANCE.NS': { price: 2450.75, name: 'Reliance Industries', sector: 'Energy' },
  'TCS.NS': { price: 3890.4, name: 'Tata Consultancy', sector: 'Technology' },
  'INFY.NS': { price: 1520.3, name: 'Infosys Ltd.', sector: 'Technology' },
  'HDFCBANK.NS': { price: 1680.5, name: 'HDFC Bank', sector: 'Finance' },
  '0700.HK': { price: 378.4, name: 'Tencent Holdings', sector: 'Technology' },
  '9988.HK': { price: 82.15, name: 'Alibaba Group', sector: 'Consumer' },
  '0005.HK': { price: 65.3, name: 'HSBC Holdings', sector: 'Finance' },
};

function simulatedForSymbols(symbols: string[], market: string): QuoteStock[] {
  return symbols.map((sym) => {
    const base = BASE_SIM[sym] || {
      price: 100 + Math.random() * 200,
      name: sym,
      sector: 'Unknown',
    };
    const change = (Math.random() - 0.48) * base.price * 0.03;
    const price = Math.round((base.price + change) * 100) / 100;
    return {
      symbol: sym,
      name: base.name,
      price,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / base.price) * 10000) / 100,
      volume: Math.floor(Math.random() * 80 + 10) + 'M',
      marketCap: Math.floor(Math.random() * 3000 + 100) + 'B',
      dayHigh: Math.round((price + Math.random() * 3) * 100) / 100,
      dayLow: Math.round((price - Math.random() * 3) * 100) / 100,
      market,
      sector: base.sector,
    };
  });
}

export async function fetchYahooQuotes(
  symbols: string[],
  market: string
): Promise<{ stocks: QuoteStock[]; source: 'yahoo' | 'simulated' }> {
  const limited = symbols.slice(0, 20);
  if (limited.length === 0) return { stocks: [], source: 'simulated' };

  const symbolsParam = limited.join(',');
  const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolsParam)}`;

  try {
    const response = await fetch(quoteUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const data = await response.json();
      const quotes = data?.quoteResponse?.result || [];
      if (quotes.length > 0) {
        const stocks: QuoteStock[] = quotes.map((q: Record<string, unknown>) => ({
          symbol: q.symbol as string,
          name: (q.shortName || q.longName || q.symbol) as string,
          price: Number(q.regularMarketPrice) || 0,
          change: Number(q.regularMarketChange) || 0,
          changePercent: Number(q.regularMarketChangePercent) || 0,
          volume: formatVol(Number(q.regularMarketVolume) || 0),
          marketCap: formatCap(Number(q.marketCap) || 0),
          dayHigh: Number(q.regularMarketDayHigh) || 0,
          dayLow: Number(q.regularMarketDayLow) || 0,
          market,
          sector: (q.sector as string) || 'Unknown',
        }));
        return { stocks, source: 'yahoo' };
      }
    }
  } catch {
    // fall through
  }

  return { stocks: simulatedForSymbols(limited, market), source: 'simulated' };
}

export function defaultSymbolsForMarket(market: string): string[] {
  return MARKET_SYMBOLS[market] || MARKET_SYMBOLS.US;
}
