import { supabase } from './auth';
import { GlobalMarket, CurrencyRate } from '../types';

export interface GlobalTradingServiceInterface {
  getGlobalMarkets(): Promise<GlobalMarket[]>;
  getMarketStatus(exchange: string): Promise<{ isOpen: boolean; nextOpen?: Date; nextClose?: Date }>;
  getCurrencyRates(): Promise<CurrencyRate[]>;
  convertCurrency(amount: number, from: string, to: string): Promise<number>;
  placeGlobalTrade(symbol: string, exchange: string, amount: number, currency: string): Promise<{ success: boolean; error?: string }>;
  getGlobalPortfolio(userId: string): Promise<any>;
  getExchangeHours(exchange: string): Promise<{ open: string; close: string; timezone: string }>;
}

class GlobalTradingService implements GlobalTradingServiceInterface {
  private readonly SUPPORTED_EXCHANGES = [
    'NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX', 'SSE', 'NSE', 'BSE'
  ];

  private readonly MARKET_TIMEZONES = {
    'NYSE': 'America/New_York',
    'NASDAQ': 'America/New_York',
    'LSE': 'Europe/London',
    'TSE': 'Asia/Tokyo',
    'HKEX': 'Asia/Hong_Kong',
    'SSE': 'Asia/Shanghai',
    'NSE': 'Asia/Kolkata',
    'BSE': 'Asia/Kolkata'
  };

  async getGlobalMarkets(): Promise<GlobalMarket[]> {
    try {
      const markets: GlobalMarket[] = [
        {
          region: 'North America',
          exchange: 'NYSE',
          isOpen: this.isMarketOpen('NYSE'),
          openTime: '09:30',
          closeTime: '16:00',
          timezone: 'EST',
          currency: 'USD',
          indices: ['S&P 500', 'Dow Jones']
        },
        {
          region: 'North America',
          exchange: 'NASDAQ',
          isOpen: this.isMarketOpen('NASDAQ'),
          openTime: '09:30',
          closeTime: '16:00',
          timezone: 'EST',
          currency: 'USD',
          indices: ['NASDAQ Composite', 'NASDAQ 100']
        },
        {
          region: 'Europe',
          exchange: 'LSE',
          isOpen: this.isMarketOpen('LSE'),
          openTime: '08:00',
          closeTime: '16:30',
          timezone: 'GMT',
          currency: 'GBP',
          indices: ['FTSE 100', 'FTSE 250']
        },
        {
          region: 'Asia',
          exchange: 'TSE',
          isOpen: this.isMarketOpen('TSE'),
          openTime: '09:00',
          closeTime: '15:00',
          timezone: 'JST',
          currency: 'JPY',
          indices: ['Nikkei 225', 'TOPIX']
        },
        {
          region: 'Asia',
          exchange: 'HKEX',
          isOpen: this.isMarketOpen('HKEX'),
          openTime: '09:30',
          closeTime: '16:00',
          timezone: 'HKT',
          currency: 'HKD',
          indices: ['Hang Seng', 'HSI Tech']
        },
        {
          region: 'Asia',
          exchange: 'NSE',
          isOpen: this.isMarketOpen('NSE'),
          openTime: '09:15',
          closeTime: '15:30',
          timezone: 'IST',
          currency: 'INR',
          indices: ['NIFTY 50', 'NIFTY Bank']
        }
      ];

      return markets;
    } catch (error) {
      console.error('Error fetching global markets:', error);
      return [];
    }
  }

  async getMarketStatus(exchange: string): Promise<{ isOpen: boolean; nextOpen?: Date; nextClose?: Date }> {
    try {
      const isOpen = this.isMarketOpen(exchange);
      const { nextOpen, nextClose } = this.getNextMarketTimes(exchange);

      return { isOpen, nextOpen, nextClose };
    } catch (error) {
      console.error('Error getting market status:', error);
      return { isOpen: false };
    }
  }

  async getCurrencyRates(): Promise<CurrencyRate[]> {
    try {
      // In real implementation, fetch from currency API
      const mockRates: CurrencyRate[] = [
        { from: 'USD', to: 'INR', rate: 83.25, lastUpdated: new Date() },
        { from: 'EUR', to: 'INR', rate: 90.15, lastUpdated: new Date() },
        { from: 'GBP', to: 'INR', rate: 105.30, lastUpdated: new Date() },
        { from: 'JPY', to: 'INR', rate: 0.56, lastUpdated: new Date() },
        { from: 'HKD', to: 'INR', rate: 10.65, lastUpdated: new Date() },
        { from: 'SGD', to: 'INR', rate: 61.80, lastUpdated: new Date() }
      ];

      return mockRates;
    } catch (error) {
      console.error('Error fetching currency rates:', error);
      return [];
    }
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    try {
      if (from === to) return amount;

      const rates = await this.getCurrencyRates();
      const rate = rates.find(r => r.from === from && r.to === to);

      if (!rate) {
        // Try reverse conversion
        const reverseRate = rates.find(r => r.from === to && r.to === from);
        if (reverseRate) {
          return amount / reverseRate.rate;
        }
        throw new Error(`Exchange rate not found for ${from} to ${to}`);
      }

      return amount * rate.rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  async placeGlobalTrade(symbol: string, exchange: string, amount: number, currency: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.SUPPORTED_EXCHANGES.includes(exchange)) {
        return { success: false, error: 'Exchange not supported' };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Check if market is open
      const marketStatus = await this.getMarketStatus(exchange);
      if (!marketStatus.isOpen) {
        return { success: false, error: `${exchange} market is currently closed` };
      }

      // Convert amount to INR for balance check
      const amountInINR = currency === 'INR' ? amount : await this.convertCurrency(amount, currency, 'INR');
      const userBalance = await this.getUserBalance(user.user.id);

      if (amountInINR > userBalance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create global trade record
      const tradeId = this.generateTradeId();
      const { error } = await supabase
        .from('global_trades')
        .insert({
          id: tradeId,
          user_id: user.user.id,
          symbol,
          exchange,
          amount,
          currency,
          amount_inr: amountInINR,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Deduct amount from user balance
      await this.updateUserBalance(user.user.id, -amountInINR);

      // Simulate trade execution
      this.executeGlobalTrade(tradeId);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getGlobalPortfolio(userId: string): Promise<any> {
    try {
      const { data: trades, error } = await supabase
        .from('global_trades')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      // Group trades by exchange and currency
      const portfolioByExchange = trades.reduce((acc: any, trade: any) => {
        if (!acc[trade.exchange]) {
          acc[trade.exchange] = {
            exchange: trade.exchange,
            currency: trade.currency,
            totalInvested: 0,
            currentValue: 0,
            positions: []
          };
        }

        acc[trade.exchange].totalInvested += trade.amount;
        acc[trade.exchange].currentValue += trade.amount * (1 + Math.random() * 0.1 - 0.05); // Mock P&L

        return acc;
      }, {});

      return {
        totalValueINR: Object.values(portfolioByExchange).reduce((sum: number, portfolio: any) => 
          sum + portfolio.currentValue, 0),
        portfolioByExchange: Object.values(portfolioByExchange)
      };
    } catch (error) {
      console.error('Error fetching global portfolio:', error);
      return null;
    }
  }

  async getExchangeHours(exchange: string): Promise<{ open: string; close: string; timezone: string }> {
    const exchangeHours: { [key: string]: { open: string; close: string; timezone: string } } = {
      'NYSE': { open: '09:30', close: '16:00', timezone: 'EST' },
      'NASDAQ': { open: '09:30', close: '16:00', timezone: 'EST' },
      'LSE': { open: '08:00', close: '16:30', timezone: 'GMT' },
      'TSE': { open: '09:00', close: '15:00', timezone: 'JST' },
      'HKEX': { open: '09:30', close: '16:00', timezone: 'HKT' },
      'NSE': { open: '09:15', close: '15:30', timezone: 'IST' },
      'BSE': { open: '09:15', close: '15:30', timezone: 'IST' }
    };

    return exchangeHours[exchange] || { open: '09:00', close: '17:00', timezone: 'UTC' };
  }

  // Private helper methods
  private isMarketOpen(exchange: string): boolean {
    // Simplified market hours check - in real implementation, consider holidays and exact timezones
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Basic hour checks (simplified)
    switch (exchange) {
      case 'NYSE':
      case 'NASDAQ':
        return hour >= 9 && hour < 16; // EST approximation
      case 'LSE':
        return hour >= 8 && hour < 16; // GMT approximation
      case 'TSE':
        return hour >= 9 && hour < 15; // JST approximation
      case 'HKEX':
        return hour >= 9 && hour < 16; // HKT approximation
      case 'NSE':
      case 'BSE':
        return hour >= 9 && hour < 15; // IST
      default:
        return false;
    }
  }

  private getNextMarketTimes(exchange: string): { nextOpen: Date; nextClose: Date } {
    const now = new Date();
    const nextOpen = new Date(now);
    const nextClose = new Date(now);

    // Simplified calculation - in real implementation, use proper timezone libraries
    if (this.isMarketOpen(exchange)) {
      // Market is open, next close is today
      const hours = this.getExchangeHours(exchange);
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);
      nextClose.setHours(closeHour, closeMinute, 0, 0);

      // Next open is tomorrow
      nextOpen.setDate(nextOpen.getDate() + 1);
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      nextOpen.setHours(openHour, openMinute, 0, 0);
    } else {
      // Market is closed, next open is tomorrow (or Monday if weekend)
      const hours = this.getExchangeHours(exchange);
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      
      nextOpen.setDate(nextOpen.getDate() + 1);
      if (nextOpen.getDay() === 0) nextOpen.setDate(nextOpen.getDate() + 1); // Skip Sunday
      if (nextOpen.getDay() === 6) nextOpen.setDate(nextOpen.getDate() + 2); // Skip Saturday
      nextOpen.setHours(openHour, openMinute, 0, 0);

      // Next close is same day as next open
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);
      nextClose.setTime(nextOpen.getTime());
      nextClose.setHours(closeHour, closeMinute, 0, 0);
    }

    return { nextOpen, nextClose };
  }

  private async executeGlobalTrade(tradeId: string): Promise<void> {
    // Simulate trade execution delay
    setTimeout(async () => {
      const success = Math.random() > 0.05; // 95% success rate

      await supabase
        .from('global_trades')
        .update({
          status: success ? 'completed' : 'failed',
          executed_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (!success) {
        // Refund amount if trade failed
        const { data: trade } = await supabase
          .from('global_trades')
          .select('user_id, amount_inr')
          .eq('id', tradeId)
          .single();

        if (trade) {
          await this.updateUserBalance(trade.user_id, trade.amount_inr);
        }
      }
    }, 2000 + Math.random() * 3000); // 2-5 second execution time
  }

  private async getUserBalance(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    return data?.balance || 0;
  }

  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount_change: amount
    });
  }

  private generateTradeId(): string {
    return 'GT' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

export const globalTradingService = new GlobalTradingService();