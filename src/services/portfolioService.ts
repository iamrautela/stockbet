import { apiService } from './api';

export interface Portfolio {
  id: number;
  user_id: number;
  holdings: string;
  created_at: string;
}

export interface PortfolioCreate {
  holdings: string;
}

class PortfolioService {
  async getPortfolio(): Promise<Portfolio | null> {
    try {
      const portfolio = await apiService.get('/portfolio/me');
      return portfolio;
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
  }

  async updatePortfolio(portfolioData: PortfolioCreate): Promise<Portfolio> {
    try {
      const portfolio = await apiService.post('/portfolio/update', portfolioData);
      return portfolio;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export const portfolioService = new PortfolioService(); 