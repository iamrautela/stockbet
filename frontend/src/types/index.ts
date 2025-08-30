export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  avatar?: string;
  joinedAt: Date;
  totalBets: number;
  winRate: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  bankAccounts: BankAccount[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  tradingExperience: 'beginner' | 'intermediate' | 'expert';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  isVerified: boolean;
  isPrimary: boolean;
  addedAt: Date;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  exchange: string;
  sector: string;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  beta?: number;
  volatility?: number;
}

export interface Bet {
  id: string;
  userId: string;
  stockSymbol: string;
  stockName: string;
  betType: 'up' | 'down' | 'target' | 'range' | 'volatility' | 'ipo' | 'merger';
  amount: number;
  entryPrice: number;
  targetPrice?: number;
  targetRange?: { min: number; max: number };
  expiryTime: Date;
  status: 'active' | 'won' | 'lost' | 'expired';
  potentialPayout: number;
  actualPayout?: number;
  odds: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: Date;
  settledAt?: Date;
  riskScore: number;
}

export interface MarketData {
  stocks: Stock[];
  indices: {
    name: string;
    value: number;
    change: number;
    changePercent: number;
    region: string;
  }[];
  lastUpdated: Date;
  volatilityIndex: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface TradingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  netPnL: number;
  winRate: number;
}

export interface MarketAlert {
  id: string;
  userId: string;
  stockSymbol: string;
  alertType: 'price_above' | 'price_below' | 'volume_spike' | 'news' | 'volatility';
  threshold: number;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'fee';
  amount: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  bankAccountId?: string;
  description: string;
  fees: number;
  createdAt: Date;
  completedAt?: Date;
  reference: string;
}

export interface IPOData {
  id: string;
  companyName: string;
  symbol: string;
  sector: string;
  priceRange: { min: number; max: number };
  lotSize: number;
  openDate: Date;
  closeDate: Date;
  listingDate: Date;
  status: 'upcoming' | 'open' | 'closed' | 'listed';
  subscriptionRate: number;
  gmpPrice?: number; // Grey Market Premium
  financials: {
    revenue: number;
    profit: number;
    peRatio: number;
    roe: number;
  };
}

export interface MergerData {
  id: string;
  acquirer: string;
  target: string;
  dealValue: number;
  currency: string;
  announcedDate: Date;
  expectedClosingDate: Date;
  status: 'announced' | 'pending_approval' | 'completed' | 'terminated';
  probability: number;
  premium: number;
  sector: string;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  totalInvested: number;
  unrealizedPnL: number;
  realizedPnL: number;
  dayChange: number;
  positions: Position[];
  riskMetrics: {
    var: number; // Value at Risk
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
  };
}

export interface Position {
  id: string;
  stockSymbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  dayChange: number;
  weight: number; // Portfolio weight percentage
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: Date;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevantStocks: string[];
  category: 'earnings' | 'merger' | 'ipo' | 'regulatory' | 'market' | 'general';
  impact: 'high' | 'medium' | 'low';
}

export interface RiskAssessment {
  userId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'extreme';
  riskScore: number; // 0-100
  factors: {
    concentrationRisk: number;
    leverageRisk: number;
    volatilityRisk: number;
    liquidityRisk: number;
  };
  recommendations: string[];
  lastUpdated: Date;
}

export interface TradingBot {
  id: string;
  userId: string;
  name: string;
  strategy: 'momentum' | 'mean_reversion' | 'arbitrage' | 'sentiment';
  isActive: boolean;
  parameters: { [key: string]: any };
  performance: {
    totalTrades: number;
    winRate: number;
    totalReturn: number;
    sharpeRatio: number;
  };
  createdAt: Date;
}

export interface GlobalMarket {
  region: string;
  exchange: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  timezone: string;
  currency: string;
  indices: string[];
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}