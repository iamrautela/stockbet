import { apiService } from './api';

export interface MarketData {
  id: number;
  symbol: string;
  price: number;
  timestamp: string;
}

export interface MarketDataCreate {
  symbol: string;
  price: number;
}

class MarketDataService {
  async getMarketData(): Promise<MarketData[]> {
    try {
      const marketData = await apiService.get('/market/data');
      return marketData;
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      return [];
    }
  }

  async addMarketData(data: MarketDataCreate): Promise<MarketData> {
    try {
      const marketData = await apiService.post('/market/add', data);
      return marketData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const marketDataService = new MarketDataService(); 