import { apiService } from './api';

export interface Bet {
  id: number;
  user_id: number;
  market: string;
  amount: number;
  direction: string;
  status: string;
  created_at: string;
}

export interface BetCreate {
  market: string;
  amount: number;
  direction: string;
}

class BettingService {
  async placeBet(betData: BetCreate): Promise<Bet> {
    try {
      const bet = await apiService.post('/bets/place', betData);
      return bet;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getActiveBets(): Promise<Bet[]> {
    try {
      const bets = await apiService.get('/bets/active');
      return bets;
    } catch (error: any) {
      console.error('Error fetching active bets:', error);
      return [];
    }
  }

  async getBetHistory(): Promise<Bet[]> {
    try {
      // For now, we'll use the same endpoint as active bets
      // You might want to add a separate endpoint for bet history
      const bets = await apiService.get('/bets/active');
      return bets;
    } catch (error: any) {
      console.error('Error fetching bet history:', error);
      return [];
    }
  }
}

export const bettingService = new BettingService(); 