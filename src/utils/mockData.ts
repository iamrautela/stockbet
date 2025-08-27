import { Stock, MarketData } from '../types';

const stockData = [
  // US Markets (NASDAQ)
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 175.50, exchange: 'NASDAQ', marketCap: '$2.8T', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 138.20, exchange: 'NASDAQ', marketCap: '$1.7T', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 412.30, exchange: 'NASDAQ', marketCap: '$3.1T', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 248.80, exchange: 'NASDAQ', marketCap: '$790B', sector: 'Automotive' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 155.20, exchange: 'NASDAQ', marketCap: '$1.6T', sector: 'E-commerce' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 875.30, exchange: 'NASDAQ', marketCap: '$2.2T', sector: 'Semiconductors' },
  { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 485.20, exchange: 'NASDAQ', marketCap: '$1.2T', sector: 'Social Media' },
  { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 485.90, exchange: 'NASDAQ', marketCap: '$210B', sector: 'Streaming' },
  
  // Indian Markets (NSE/BSE)
  { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3450.00, exchange: 'NSE', marketCap: '₹12.5L Cr', sector: 'IT Services' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2450.20, exchange: 'NSE', marketCap: '₹16.5L Cr', sector: 'Oil & Gas' },
  { symbol: 'INFY', name: 'Infosys Limited', basePrice: 1580.75, exchange: 'NSE', marketCap: '₹6.5L Cr', sector: 'IT Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', basePrice: 1642.30, exchange: 'NSE', marketCap: '₹12.1L Cr', sector: 'Banking' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', basePrice: 1089.45, exchange: 'NSE', marketCap: '₹7.6L Cr', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', basePrice: 1298.60, exchange: 'NSE', marketCap: '₹7.8L Cr', sector: 'Telecom' },
  
  // Hong Kong Markets (HKEX)
  { symbol: '0700.HK', name: 'Tencent Holdings', basePrice: 368.20, exchange: 'HKEX', marketCap: 'HK$3.5T', sector: 'Technology' },
  { symbol: '0941.HK', name: 'China Mobile', basePrice: 78.45, exchange: 'HKEX', marketCap: 'HK$1.6T', sector: 'Telecom' },
  { symbol: '0005.HK', name: 'HSBC Holdings', basePrice: 62.15, exchange: 'HKEX', marketCap: 'HK$1.2T', sector: 'Banking' },
  { symbol: '1299.HK', name: 'AIA Group', basePrice: 68.90, exchange: 'HKEX', marketCap: 'HK$820B', sector: 'Insurance' },
];

const indices = [
  { name: 'NASDAQ', baseValue: 15420.00, region: 'US' },
  { name: 'S&P 500', baseValue: 4890.50, region: 'US' },
  { name: 'NIFTY 50', baseValue: 22150.00, region: 'India' },
  { name: 'SENSEX', baseValue: 73200.00, region: 'India' },
  { name: 'Hang Seng', baseValue: 17850.00, region: 'Hong Kong' },
  { name: 'HSI Tech', baseValue: 3420.00, region: 'Hong Kong' },
];

// Market hours for different exchanges
const marketHours = {
  NASDAQ: { open: 9.5, close: 16 }, // 9:30 AM - 4:00 PM EST
  NSE: { open: 9.25, close: 15.5 }, // 9:15 AM - 3:30 PM IST
  HKEX: { open: 9.5, close: 16 }, // 9:30 AM - 4:00 PM HKT
};

// Simulate market volatility based on time and news events
const getVolatilityFactor = (exchange: string) => {
  const now = new Date();
  const hour = now.getHours();
  
  // Higher volatility during market open/close
  let volatilityMultiplier = 1;
  
  if (exchange === 'NASDAQ') {
    // US market hours (assuming EST)
    if (hour >= 9 && hour <= 10 || hour >= 15 && hour <= 16) {
      volatilityMultiplier = 1.5;
    }
  } else if (exchange === 'NSE') {
    // Indian market hours
    if (hour >= 9 && hour <= 10 || hour >= 14 && hour <= 15) {
      volatilityMultiplier = 1.3;
    }
  }
  
  return volatilityMultiplier;
};

// Generate realistic price movements with momentum
let priceHistory: { [key: string]: number[] } = {};

export const generateMockData = (): MarketData => {
  const stocks: Stock[] = stockData.map(stock => {
    // Initialize price history if not exists
    if (!priceHistory[stock.symbol]) {
      priceHistory[stock.symbol] = [stock.basePrice];
    }
    
    const history = priceHistory[stock.symbol];
    const lastPrice = history[history.length - 1];
    
    // Generate momentum-based price movement
    const volatilityFactor = getVolatilityFactor(stock.exchange);
    const baseVolatility = stock.exchange === 'NASDAQ' ? 0.003 : 
                          stock.exchange === 'NSE' ? 0.004 : 0.0025;
    
    const momentum = history.length > 1 ? 
      (history[history.length - 1] - history[history.length - 2]) / history[history.length - 2] : 0;
    
    // Add some randomness with momentum consideration
    const randomChange = (Math.random() - 0.5) * baseVolatility * volatilityFactor;
    const momentumInfluence = momentum * 0.3; // 30% momentum carry-over
    
    const priceChange = randomChange + momentumInfluence;
    const newPrice = lastPrice * (1 + priceChange);
    
    // Update price history (keep last 100 prices)
    history.push(newPrice);
    if (history.length > 100) {
      history.shift();
    }
    
    const change = newPrice - stock.basePrice;
    const changePercent = (change / stock.basePrice) * 100;
    
    // Generate realistic volume based on price movement
    const volumeMultiplier = Math.abs(changePercent) > 2 ? 1.5 : 1;
    const baseVolume = stock.exchange === 'NASDAQ' ? 25000000 : 
                      stock.exchange === 'NSE' ? 5000000 : 15000000;
    
    return {
      ...stock,
      price: newPrice,
      change,
      changePercent,
      volume: Math.floor((Math.random() * baseVolume + baseVolume * 0.2) * volumeMultiplier),
      dayHigh: Math.max(newPrice, stock.basePrice * 1.02),
      dayLow: Math.min(newPrice, stock.basePrice * 0.98),
      previousClose: stock.basePrice,
    };
  });

  const marketIndices = indices.map(index => {
    const volatility = (Math.random() - 0.5) * 0.015; // -1.5% to +1.5%
    const value = index.baseValue * (1 + volatility);
    const change = value - index.baseValue;
    const changePercent = (change / index.baseValue) * 100;
    
    return {
      name: index.name,
      value,
      change,
      changePercent,
      region: index.region,
    };
  });

  return {
    stocks,
    indices: marketIndices,
    lastUpdated: new Date(),
  };
};

// Generate news events that could affect stock prices
export const generateMarketNews = () => {
  const newsEvents = [
    "Fed announces interest rate decision",
    "Tech earnings season begins",
    "Oil prices surge amid geopolitical tensions",
    "RBI monetary policy meeting scheduled",
    "China manufacturing data beats expectations",
    "US inflation data released",
    "Major tech company announces breakthrough",
    "Banking sector shows strong quarterly results",
  ];
  
  return newsEvents[Math.floor(Math.random() * newsEvents.length)];
};

// Calculate market sentiment based on overall movements
export const calculateMarketSentiment = (stocks: Stock[]) => {
  const positiveStocks = stocks.filter(stock => stock.changePercent > 0).length;
  const totalStocks = stocks.length;
  const sentimentScore = (positiveStocks / totalStocks) * 100;
  
  if (sentimentScore > 60) return { sentiment: 'Bullish', color: 'text-emerald-400', score: sentimentScore };
  if (sentimentScore < 40) return { sentiment: 'Bearish', color: 'text-red-400', score: sentimentScore };
  return { sentiment: 'Neutral', color: 'text-gray-400', score: sentimentScore };
};