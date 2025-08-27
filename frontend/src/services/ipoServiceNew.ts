import { apiService } from './api';

export interface IPO {
  id: number;
  name: string;
  price: number;
  available_shares: number;
  created_at: string;
}

export interface IPOCreate {
  name: string;
  price: number;
  available_shares: number;
}

class IPOService {
  async listIPOs(): Promise<IPO[]> {
    try {
      const ipos = await apiService.get('/ipo/list');
      return ipos;
    } catch (error: any) {
      console.error('Error fetching IPOs:', error);
      return [];
    }
  }

  async bidIPO(ipoData: IPOCreate): Promise<IPO> {
    try {
      const ipo = await apiService.post('/ipo/bid', ipoData);
      return ipo;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const ipoService = new IPOService(); 