import { supabase } from './auth';
import { Bet, OrderBook, Position, Portfolio, RiskAssessment } from '../types';

export interface TradingServiceInterface {
  placeBet(betData: Omit<Bet, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; betId?: string; error?: string }>;
  getOrderBook(symbol: string): Promise<OrderBook | null>;
  getUserPortfolio(userId: string): Promise<Portfolio | null>;
  calculateRiskAssessment(userId: string): Promise<RiskAssessment>;
  executeLeveragedTrade(symbol: string, amount: number, leverage: number, direction: 'long' | 'short'): Promise<{ success: boolean; error?: string }>;
  setStopLoss(betId: string, stopLossPrice: number): Promise<{ success: boolean; error?: string }>;
  setTakeProfit(betId: string, takeProfitPrice: number): Promise<{ success: boolean; error?: string }>;
  getMarketDepth(symbol: string): Promise<{ bids: any[]; asks: any[] }>;
}

class TradingService implements TradingServiceInterface {
  private readonly MAX_LEVERAGE = 10;
  private readonly MIN_BET_AMOUNT = 100;
  private readonly MAX_BET_AMOUNT = 1000000;

  async placeBet(betData: Omit<Bet, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; betId?: string; error?: string }> {
    try {
      // Validate bet amount
      if (betData.amount < this.MIN_BET_AMOUNT) {
        return { success: false, error: `Minimum bet amount is ₹${this.MIN_BET_AMOUNT}` };
      }

      if (betData.amount > this.MAX_BET_AMOUNT) {
        return { success: false, error: `Maximum bet amount is ₹${this.MAX_BET_AMOUNT}` };
      }

      // Check user balance
      const userBalance = await this.getUserBalance(betData.userId);
      const requiredAmount = betData.leverage ? betData.amount / betData.leverage : betData.amount;
      
      if (requiredAmount > userBalance) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Calculate risk score
      const riskScore = await this.calculateBetRiskScore(betData);
      
      // Check if bet exceeds user's risk tolerance
      const userRiskProfile = await this.getUserRiskProfile(betData.userId);
      if (!this.isWithinRiskTolerance(riskScore, userRiskProfile)) {
        return { success: false, error: 'Bet exceeds your risk tolerance. Please reduce amount or leverage.' };
      }

      // Generate bet ID
      const betId = this.generateBetId();

      // Store bet in database
      const { error } = await supabase
        .from('bets')
        .insert({
          id: betId,
          user_id: betData.userId,
          stock_symbol: betData.stockSymbol,
          stock_name: betData.stockName,
          bet_type: betData.betType,
          amount: betData.amount,
          entry_price: betData.entryPrice,
          target_price: betData.targetPrice,
          target_range: betData.targetRange,
          expiry_time: betData.expiryTime.toISOString(),
          potential_payout: betData.potentialPayout,
          odds: betData.odds,
          leverage: betData.leverage,
          stop_loss: betData.stopLoss,
          take_profit: betData.takeProfit,
          risk_score: riskScore,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Deduct amount from user balance
      await this.updateUserBalance(betData.userId, -requiredAmount);

      // Set up automatic monitoring for stop loss and take profit
      this.setupBetMonitoring(betId);

      return { success: true, betId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBook | null> {
    try {
      // In real implementation, fetch from market data provider
      const mockOrderBook: OrderBook = {
        symbol,
        bids: this.generateOrderBookEntries('bid'),
        asks: this.generateOrderBookEntries('ask'),
        lastUpdated: new Date()
      };

      return mockOrderBook;
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }

  async getUserPortfolio(userId: string): Promise<Portfolio | null> {
    try {
      const { data: bets, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      const positions: Position[] = [];
      let totalValue = 0;
      let totalInvested = 0;
      let unrealizedPnL = 0;

      // Group bets by stock symbol to create positions
      const stockGroups = bets.reduce((groups: any, bet: any) => {
        if (!groups[bet.stock_symbol]) {
          groups[bet.stock_symbol] = [];
        }
        groups[bet.stock_symbol].push(bet);
        return groups;
      }, {});

      for (const [symbol, stockBets] of Object.entries(stockGroups)) {
        const betsArray = stockBets as any[];
        const totalQuantity = betsArray.reduce((sum, bet) => sum + bet.amount, 0);
        const avgPrice = betsArray.reduce((sum, bet) => sum + (bet.entry_price * bet.amount), 0) / totalQuantity;
        
        // Get current price (mock)
        const currentPrice = avgPrice * (1 + (Math.random() - 0.5) * 0.1);
        const positionValue = totalQuantity * currentPrice;
        const positionPnL = positionValue - totalQuantity * avgPrice;

        positions.push({
          id: `pos_${symbol}`,
          stockSymbol: symbol,
          quantity: totalQuantity,
          avgPrice,
          currentPrice,
          unrealizedPnL: positionPnL,
          dayChange: (Math.random() - 0.5) * 0.05,
          weight: 0 // Will be calculated after total value
        });

        totalValue += positionValue;
        totalInvested += totalQuantity * avgPrice;
        unrealizedPnL += positionPnL;
      }

      // Calculate position weights
      positions.forEach(position => {
        position.weight = (position.quantity * position.currentPrice / totalValue) * 100;
      });

      const portfolio: Portfolio = {
        userId,
        totalValue,
        totalInvested,
        unrealizedPnL,
        realizedPnL: await this.getRealized PnL(userId),
        dayChange: (Math.random() - 0.5) * 0.03,
        positions,
        riskMetrics: await this.calculatePortfolioRiskMetrics(positions)
      };

      return portfolio;
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      return null;
    }
  }

  async calculateRiskAssessment(userId: string): Promise<RiskAssessment> {
    try {
      const portfolio = await this.getUserPortfolio(userId);
      const activeBets = await this.getUserActiveBets(userId);
      
      let riskScore = 0;
      const factors = {
        concentrationRisk: 0,
        leverageRisk: 0,
        volatilityRisk: 0,
        liquidityRisk: 0
      };

      if (portfolio) {
        // Concentration risk - check if portfolio is too concentrated in few stocks
        const maxWeight = Math.max(...portfolio.positions.map(p => p.weight));
        factors.concentrationRisk = Math.min(maxWeight / 20, 1) * 25; // Max 25 points

        // Volatility risk - based on portfolio volatility
        const avgVolatility = portfolio.positions.reduce((sum, p) => sum + Math.abs(p.dayChange), 0) / portfolio.positions.length;
        factors.volatilityRisk = Math.min(avgVolatility * 500, 25); // Max 25 points
      }

      if (activeBets.length > 0) {
        // Leverage risk - check average leverage used
        const avgLeverage = activeBets.reduce((sum, bet) => sum + (bet.leverage || 1), 0) / activeBets.length;
        factors.leverageRisk = Math.min((avgLeverage - 1) * 5, 25); // Max 25 points

        // Liquidity risk - based on bet types and expiry times
        const shortTermBets = activeBets.filter(bet => 
          new Date(bet.expiry_time).getTime() - Date.now() < 24 * 60 * 60 * 1000
        ).length;
        factors.liquidityRisk = Math.min((shortTermBets / activeBets.length) * 25, 25); // Max 25 points
      }

      riskScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0);

      let overallRisk: 'low' | 'medium' | 'high' | 'extreme';
      if (riskScore < 25) overallRisk = 'low';
      else if (riskScore < 50) overallRisk = 'medium';
      else if (riskScore < 75) overallRisk = 'high';
      else overallRisk = 'extreme';

      const recommendations = this.generateRiskRecommendations(factors, overallRisk);

      return {
        userId,
        overallRisk,
        riskScore,
        factors,
        recommendations,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error calculating risk assessment:', error);
      return {
        userId,
        overallRisk: 'medium',
        riskScore: 50,
        factors: {
          concentrationRisk: 0,
          leverageRisk: 0,
          volatilityRisk: 0,
          liquidityRisk: 0
        },
        recommendations: ['Unable to calculate risk. Please try again.'],
        lastUpdated: new Date()
      };
    }
  }

  async executeLeveragedTrade(symbol: string, amount: number, leverage: number, direction: 'long' | 'short'): Promise<{ success: boolean; error?: string }> {
    try {
      if (leverage > this.MAX_LEVERAGE) {
        return { success: false, error: `Maximum leverage allowed is ${this.MAX_LEVERAGE}x` };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const margin = amount / leverage;
      const userBalance = await this.getUserBalance(user.user.id);

      if (margin > userBalance) {
        return { success: false, error: 'Insufficient margin balance' };
      }

      // Create leveraged position
      const positionId = this.generatePositionId();
      const { error } = await supabase
        .from('leveraged_positions')
        .insert({
          id: positionId,
          user_id: user.user.id,
          symbol,
          amount,
          leverage,
          direction,
          margin,
          entry_price: await this.getCurrentPrice(symbol),
          status: 'open',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Deduct margin from user balance
      await this.updateUserBalance(user.user.id, -margin);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async setStopLoss(betId: string, stopLossPrice: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bets')
        .update({ stop_loss: stopLossPrice })
        .eq('id', betId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async setTakeProfit(betId: string, takeProfitPrice: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bets')
        .update({ take_profit: takeProfitPrice })
        .eq('id', betId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getMarketDepth(symbol: string): Promise<{ bids: any[]; asks: any[] }> {
    // Mock market depth data
    return {
      bids: this.generateMarketDepth('bid'),
      asks: this.generateMarketDepth('ask')
    };
  }

  // Private helper methods
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

  private async calculateBetRiskScore(betData: Omit<Bet, 'id' | 'createdAt' | 'status'>): Promise<number> {
    let riskScore = 0;

    // Amount risk (0-25 points)
    const amountRisk = Math.min((betData.amount / 100000) * 25, 25);
    riskScore += amountRisk;

    // Leverage risk (0-25 points)
    if (betData.leverage && betData.leverage > 1) {
      const leverageRisk = Math.min((betData.leverage - 1) * 5, 25);
      riskScore += leverageRisk;
    }

    // Time risk (0-25 points)
    const timeToExpiry = new Date(betData.expiryTime).getTime() - Date.now();
    const hoursToExpiry = timeToExpiry / (1000 * 60 * 60);
    const timeRisk = Math.max(25 - hoursToExpiry, 0);
    riskScore += Math.min(timeRisk, 25);

    // Bet type risk (0-25 points)
    const betTypeRisk = {
      'up': 10,
      'down': 10,
      'target': 20,
      'range': 15,
      'volatility': 25,
      'ipo': 25,
      'merger': 20
    };
    riskScore += betTypeRisk[betData.betType] || 15;

    return Math.min(riskScore, 100);
  }

  private async getUserRiskProfile(userId: string): Promise<'conservative' | 'moderate' | 'aggressive'> {
    const { data } = await supabase
      .from('user_profiles')
      .select('risk_profile')
      .eq('id', userId)
      .single();

    return data?.risk_profile || 'moderate';
  }

  private isWithinRiskTolerance(riskScore: number, riskProfile: string): boolean {
    const toleranceLimits = {
      'conservative': 40,
      'moderate': 70,
      'aggressive': 100
    };

    return riskScore <= toleranceLimits[riskProfile as keyof typeof toleranceLimits];
  }

  private async getUserActiveBets(userId: string): Promise<any[]> {
    const { data } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    return data || [];
  }

  private async getRealizedPnL(userId: string): Promise<number> {
    const { data } = await supabase
      .from('bets')
      .select('amount, actual_payout')
      .eq('user_id', userId)
      .in('status', ['won', 'lost']);

    if (!data) return 0;

    return data.reduce((sum, bet) => {
      return sum + ((bet.actual_payout || 0) - bet.amount);
    }, 0);
  }

  private async calculatePortfolioRiskMetrics(positions: Position[]): Promise<any> {
    // Simplified risk metrics calculation
    const returns = positions.map(p => p.dayChange);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    return {
      var: volatility * Math.sqrt(252) * 1.65, // 95% VaR
      sharpeRatio: avgReturn / volatility,
      maxDrawdown: Math.min(...returns),
      beta: 1 + (Math.random() - 0.5) * 0.5 // Mock beta
    };
  }

  private generateRiskRecommendations(factors: any, overallRisk: string): string[] {
    const recommendations = [];

    if (factors.concentrationRisk > 15) {
      recommendations.push('Consider diversifying your portfolio across more stocks and sectors');
    }

    if (factors.leverageRisk > 15) {
      recommendations.push('Reduce leverage usage to lower your risk exposure');
    }

    if (factors.volatilityRisk > 15) {
      recommendations.push('Consider adding more stable, low-volatility stocks to your portfolio');
    }

    if (factors.liquidityRisk > 15) {
      recommendations.push('Avoid too many short-term bets to maintain liquidity');
    }

    if (overallRisk === 'extreme') {
      recommendations.push('Your risk level is extremely high. Consider reducing position sizes immediately');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your risk profile looks good. Continue with your current strategy');
    }

    return recommendations;
  }

  private generateOrderBookEntries(side: 'bid' | 'ask'): any[] {
    const entries = [];
    const basePrice = 1000 + Math.random() * 500;
    
    for (let i = 0; i < 10; i++) {
      const priceOffset = side === 'bid' ? -i * 0.5 : i * 0.5;
      entries.push({
        price: basePrice + priceOffset,
        quantity: Math.floor(Math.random() * 1000) + 100,
        orders: Math.floor(Math.random() * 10) + 1
      });
    }

    return entries;
  }

  private generateMarketDepth(side: 'bid' | 'ask'): any[] {
    return Array.from({ length: 20 }, (_, i) => ({
      price: 1000 + (side === 'bid' ? -i : i) * 0.25,
      quantity: Math.floor(Math.random() * 5000) + 500,
      orders: Math.floor(Math.random() * 20) + 1
    }));
  }

  private setupBetMonitoring(betId: string): void {
    // In real implementation, set up real-time monitoring
    // This would integrate with market data feeds and execute stop loss/take profit orders
    console.log(`Setting up monitoring for bet ${betId}`);
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    // Mock current price - in real implementation, fetch from market data provider
    return 1000 + Math.random() * 500;
  }

  private generateBetId(): string {
    return 'BET' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generatePositionId(): string {
    return 'POS' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

export const tradingService = new TradingService();