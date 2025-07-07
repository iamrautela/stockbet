import axios from 'axios';

export interface YahooFinanceData {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  shortName: string;
  longName: string;
}

export interface BinanceTickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  count: number;
}

class MarketDataService {
  private yahooFinanceAPI = 'https://query1.finance.yahoo.com/v8/finance/chart/';
  private binanceAPI = 'https://api.binance.com/api/v3/ticker/24hr';
  private alphaVantageAPI = 'https://www.alphavantage.co/query';
  private alphaVantageKey = 'demo'; // Replace with actual API key

  // Yahoo Finance symbols mapping
  private symbolMapping = {
    // US Stocks
    'AAPL': 'AAPL',
    'GOOGL': 'GOOGL',
    'MSFT': 'MSFT',
    'TSLA': 'TSLA',
    'AMZN': 'AMZN',
    'NVDA': 'NVDA',
    'META': 'META',
    'NFLX': 'NFLX',
    
    // Indian Stocks (NSE)
    'TCS': 'TCS.NS',
    'RELIANCE': 'RELIANCE.NS',
    'INFY': 'INFY.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    
    // Hong Kong Stocks
    '0700.HK': '0700.HK',
    '0941.HK': '0941.HK',
    '0005.HK': '0005.HK',
    '1299.HK': '1299.HK',
  };

  async fetchYahooFinanceData(symbols: string[]): Promise<any[]> {
    try {
      const promises = symbols.map(async (symbol) => {
        const yahooSymbol = this.symbolMapping[symbol as keyof typeof this.symbolMapping] || symbol;
        const response = await axios.get(`${this.yahooFinanceAPI}${yahooSymbol}`, {
          params: {
            interval: '1m',
            range: '1d'
          }
        });

        const result = response.data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        const timestamps = result.timestamp;
        const prices = quote.close;

        // Get latest data
        const latestIndex = prices.length - 1;
        const currentPrice = prices[latestIndex];
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          symbol: symbol,
          name: meta.longName || meta.shortName || symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: meta.regularMarketVolume || 0,
          dayHigh: Math.max(...prices.filter(p => p !== null)),
          dayLow: Math.min(...prices.filter(p => p !== null)),
          previousClose: previousClose,
          marketCap: this.formatMarketCap(meta.marketCap),
          exchange: this.getExchangeFromSymbol(symbol),
          sector: this.getSectorFromSymbol(symbol),
          timestamps: timestamps,
          prices: prices
        };
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      return [];
    }
  }

  async fetchBinanceData(): Promise<BinanceTickerData[]> {
    try {
      const response = await axios.get(this.binanceAPI);
      return response.data.filter((ticker: BinanceTickerData) => 
        ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'].includes(ticker.symbol)
      );
    } catch (error) {
      console.error('Error fetching Binance data:', error);
      return [];
    }
  }

  async fetchAlphaVantageData(symbol: string): Promise<any> {
    try {
      const response = await axios.get(this.alphaVantageAPI, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: '1min',
          apikey: this.alphaVantageKey
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Alpha Vantage data:', error);
      return null;
    }
  }

  private formatMarketCap(marketCap: number): string {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }

  private getExchangeFromSymbol(symbol: string): string {
    if (symbol.endsWith('.NS') || ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK', 'BHARTIARTL'].includes(symbol)) {
      return 'NSE';
    }
    if (symbol.endsWith('.HK')) {
      return 'HKEX';
    }
    return 'NASDAQ';
  }

  private getSectorFromSymbol(symbol: string): string {
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology',
      'GOOGL': 'Technology',
      'MSFT': 'Technology',
      'TSLA': 'Automotive',
      'AMZN': 'E-commerce',
      'NVDA': 'Semiconductors',
      'META': 'Social Media',
      'NFLX': 'Streaming',
      'TCS': 'IT Services',
      'RELIANCE': 'Oil & Gas',
      'INFY': 'IT Services',
      'HDFCBANK': 'Banking',
      'ICICIBANK': 'Banking',
      'BHARTIARTL': 'Telecom',
      '0700.HK': 'Technology',
      '0941.HK': 'Telecom',
      '0005.HK': 'Banking',
      '1299.HK': 'Insurance',
    };
    return sectorMap[symbol] || 'Other';
  }

  // WebSocket connection for real-time data
  setupWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      // Binance WebSocket for crypto data
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      return null;
    }
  }
}

export const marketDataService = new MarketDataService();