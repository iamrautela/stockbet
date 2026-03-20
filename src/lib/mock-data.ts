export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  dayHigh: number;
  dayLow: number;
  market: 'US' | 'IN' | 'HK';
  sector: string;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  stake: number;
  pnl: number;
  pnlPercent: number;
  status: 'open' | 'won' | 'lost' | 'settled';
  openedAt: string;
  expiresAt: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  stake: number;
  pnl: number;
  pnlPercent: number;
  outcome: 'won' | 'lost';
  settledAt: string;
  market: string;
}

export interface IPO {
  id: string;
  company: string;
  symbol: string;
  exchange: string;
  sector: string;
  date: string;
  priceBand: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  status: 'upcoming' | 'open' | 'listed';
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 198.45, change: 3.21, changePercent: 1.64, volume: '52.3M', marketCap: '3.08T', dayHigh: 199.12, dayLow: 195.80, market: 'US', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.92, change: -5.43, changePercent: -2.13, volume: '98.1M', marketCap: '790B', dayHigh: 255.10, dayLow: 247.30, market: 'US', sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 22.15, changePercent: 2.60, volume: '41.2M', marketCap: '2.15T', dayHigh: 880.00, dayLow: 852.10, market: 'US', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.60, change: 1.85, changePercent: 0.45, volume: '18.7M', marketCap: '3.09T', dayHigh: 417.20, dayLow: 413.90, market: 'US', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.20, change: -2.10, changePercent: -1.12, volume: '35.6M', marketCap: '1.92T', dayHigh: 188.50, dayLow: 184.30, market: 'US', sector: 'Consumer' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2450.75, change: 35.20, changePercent: 1.46, volume: '8.2M', marketCap: '₹16.6T', dayHigh: 2465.00, dayLow: 2420.50, market: 'IN', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', price: 3890.40, change: -28.60, changePercent: -0.73, volume: '2.1M', marketCap: '₹14.2T', dayHigh: 3925.00, dayLow: 3875.10, market: 'IN', sector: 'Technology' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', price: 1520.30, change: 12.45, changePercent: 0.83, volume: '5.8M', marketCap: '₹6.3T', dayHigh: 1535.00, dayLow: 1510.20, market: 'IN', sector: 'Technology' },
  { symbol: '0700.HK', name: 'Tencent Holdings', price: 378.40, change: 8.60, changePercent: 2.32, volume: '15.3M', marketCap: 'HK$3.6T', dayHigh: 382.00, dayLow: 370.50, market: 'HK', sector: 'Technology' },
  { symbol: '9988.HK', name: 'Alibaba Group', price: 82.15, change: -1.35, changePercent: -1.62, volume: '28.9M', marketCap: 'HK$1.7T', dayHigh: 84.50, dayLow: 81.60, market: 'HK', sector: 'Consumer' },
];

export const mockPositions: Position[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', type: 'long', entryPrice: 195.20, currentPrice: 198.45, stake: 500, pnl: 8.31, pnlPercent: 1.66, status: 'open', openedAt: '2026-03-19T09:30:00Z', expiresAt: '2026-03-19T16:00:00Z' },
  { id: '2', symbol: 'TSLA', name: 'Tesla Inc.', type: 'short', entryPrice: 252.00, currentPrice: 248.92, stake: 750, pnl: 9.14, pnlPercent: 1.22, status: 'open', openedAt: '2026-03-19T10:15:00Z', expiresAt: '2026-03-19T16:00:00Z' },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'long', entryPrice: 880.00, currentPrice: 875.30, stake: 1000, pnl: -5.34, pnlPercent: -0.53, status: 'open', openedAt: '2026-03-18T14:00:00Z', expiresAt: '2026-03-20T16:00:00Z' },
  { id: '4', symbol: 'AMZN', name: 'Amazon.com', type: 'long', entryPrice: 180.50, currentPrice: 185.20, stake: 300, pnl: 7.81, pnlPercent: 2.60, status: 'open', openedAt: '2026-03-18T11:30:00Z', expiresAt: '2026-03-19T16:00:00Z' },
];

export const mockTrades: Trade[] = [
  { id: '1', symbol: 'AAPL', type: 'long', entryPrice: 190.00, exitPrice: 196.50, stake: 500, pnl: 17.10, pnlPercent: 3.42, outcome: 'won', settledAt: '2026-03-18T16:00:00Z', market: 'US' },
  { id: '2', symbol: 'TSLA', type: 'short', entryPrice: 260.00, exitPrice: 255.30, stake: 800, pnl: 14.46, pnlPercent: 1.81, outcome: 'won', settledAt: '2026-03-17T16:00:00Z', market: 'US' },
  { id: '3', symbol: 'MSFT', type: 'long', entryPrice: 420.00, exitPrice: 415.60, stake: 600, pnl: -6.29, pnlPercent: -1.05, outcome: 'lost', settledAt: '2026-03-17T16:00:00Z', market: 'US' },
  { id: '4', symbol: 'NVDA', type: 'long', entryPrice: 850.00, exitPrice: 878.20, stake: 1200, pnl: 39.79, pnlPercent: 3.32, outcome: 'won', settledAt: '2026-03-16T16:00:00Z', market: 'US' },
  { id: '5', symbol: 'RELIANCE.NS', type: 'long', entryPrice: 2400.00, exitPrice: 2380.50, stake: 400, pnl: -3.25, pnlPercent: -0.81, outcome: 'lost', settledAt: '2026-03-15T15:30:00Z', market: 'IN' },
  { id: '6', symbol: '0700.HK', type: 'short', entryPrice: 385.00, exitPrice: 372.40, stake: 550, pnl: 18.00, pnlPercent: 3.27, outcome: 'won', settledAt: '2026-03-14T16:00:00Z', market: 'HK' },
];

export const mockIPOs: IPO[] = [
  { id: '1', company: 'Nexora AI', symbol: 'NXAI', exchange: 'NASDAQ', sector: 'AI/Technology', date: '2026-04-05', priceBand: '$22 - $26', sentiment: 'bullish', status: 'upcoming' },
  { id: '2', company: 'GreenVolt Energy', symbol: 'GVLT', exchange: 'NYSE', sector: 'Clean Energy', date: '2026-03-28', priceBand: '$14 - $18', sentiment: 'neutral', status: 'upcoming' },
  { id: '3', company: 'PayQuick Fintech', symbol: 'PAYQ', exchange: 'BSE', sector: 'Fintech', date: '2026-03-25', priceBand: '₹350 - ₹410', sentiment: 'bullish', status: 'open' },
  { id: '4', company: 'SkyBridge Logistics', symbol: 'SKBL', exchange: 'HKEX', sector: 'Logistics', date: '2026-04-12', priceBand: 'HK$28 - HK$34', sentiment: 'bearish', status: 'upcoming' },
  { id: '5', company: 'Quantum Shield Cyber', symbol: 'QSHD', exchange: 'NASDAQ', sector: 'Cybersecurity', date: '2026-03-22', priceBand: '$30 - $36', sentiment: 'bullish', status: 'open' },
];

export const mockWalletTransactions: WalletTransaction[] = [
  { id: '1', type: 'deposit', amount: 5000, status: 'completed', date: '2026-03-19T08:00:00Z', description: 'Bank Transfer' },
  { id: '2', type: 'bet', amount: -500, status: 'completed', date: '2026-03-19T09:30:00Z', description: 'Long AAPL' },
  { id: '3', type: 'payout', amount: 517.10, status: 'completed', date: '2026-03-18T16:05:00Z', description: 'Won Long AAPL' },
  { id: '4', type: 'bet', amount: -750, status: 'completed', date: '2026-03-19T10:15:00Z', description: 'Short TSLA' },
  { id: '5', type: 'withdrawal', amount: -1000, status: 'pending', date: '2026-03-18T14:00:00Z', description: 'Bank Withdrawal' },
  { id: '6', type: 'deposit', amount: 2500, status: 'completed', date: '2026-03-15T10:00:00Z', description: 'Card Deposit' },
  { id: '7', type: 'payout', amount: 814.46, status: 'completed', date: '2026-03-17T16:05:00Z', description: 'Won Short TSLA' },
];

export const walletBalance = {
  total: 7581.56,
  available: 5331.56,
  inBets: 2250.00,
  pending: 1000.00,
};

export const tradingStats = {
  totalTrades: 47,
  winRate: 68.1,
  avgReturn: 2.14,
  biggestWin: 39.79,
  biggestLoss: -12.35,
  totalPnl: 892.45,
};

export const marketFlags: Record<string, string> = {
  US: '🇺🇸',
  IN: '🇮🇳',
  HK: '🇭🇰',
};

export const marketNames: Record<string, string> = {
  US: 'United States',
  IN: 'India',
  HK: 'Hong Kong',
};

// Mini chart data generator
export const generateChartData = (basePrice: number, points: number = 24) => {
  const data = [];
  let price = basePrice * 0.97;
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * basePrice * 0.008;
    data.push({ time: i, price: Math.round(price * 100) / 100 });
  }
  return data;
};
