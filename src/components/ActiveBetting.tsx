import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Target, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { marketDataService } from '../services/marketData';
import { Bet, User } from '../types';
import toast from 'react-hot-toast';

interface ActiveBettingProps {
  user: User;
  onBetUpdate: () => void;
}

const ActiveBetting: React.FC<ActiveBettingProps> = ({ user, onBetUpdate }) => {
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadActiveBets();
    fetchRealTimeData();
    
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchRealTimeData();
        checkBetSettlement();
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadActiveBets = () => {
    const storedBets = JSON.parse(localStorage.getItem('bets') || '[]');
    const userActiveBets = storedBets.filter((bet: Bet) => 
      bet.userId === user.id && bet.status === 'active'
    );
    setActiveBets(userActiveBets);
  };

  const fetchRealTimeData = async () => {
    try {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
      const data = await marketDataService.fetchYahooFinanceData(symbols);
      setRealTimeData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setLoading(false);
    }
  };

  const checkBetSettlement = () => {
    const now = new Date();
    const updatedBets = activeBets.map(bet => {
      if (new Date(bet.expiryTime) <= now) {
        const currentStock = realTimeData.find(stock => stock.symbol === bet.stockSymbol);
        if (currentStock) {
          const settled = settleBet(bet, currentStock.price);
          return settled;
        }
      }
      return bet;
    });

    const settledBets = updatedBets.filter(bet => bet.status !== 'active');
    if (settledBets.length > 0) {
      // Update localStorage
      const allBets = JSON.parse(localStorage.getItem('bets') || '[]');
      const updatedAllBets = allBets.map((storedBet: Bet) => {
        const updated = updatedBets.find(b => b.id === storedBet.id);
        return updated || storedBet;
      });
      localStorage.setItem('bets', JSON.stringify(updatedAllBets));
      
      // Update user balance for won bets
      const wonBets = settledBets.filter(bet => bet.status === 'won');
      if (wonBets.length > 0) {
        const totalWinnings = wonBets.reduce((sum, bet) => sum + (bet.actualPayout || 0), 0);
        const updatedUser = { ...user, balance: user.balance + totalWinnings };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success(`${wonBets.length} bet(s) won! +$${totalWinnings.toFixed(2)}`);
        onBetUpdate();
      }
      
      const lostBets = settledBets.filter(bet => bet.status === 'lost');
      if (lostBets.length > 0) {
        toast.error(`${lostBets.length} bet(s) lost`);
      }
      
      setActiveBets(updatedBets.filter(bet => bet.status === 'active'));
    }
  };

  const settleBet = (bet: Bet, currentPrice: number): Bet => {
    let isWon = false;
    
    switch (bet.betType) {
      case 'up':
        isWon = currentPrice > bet.entryPrice;
        break;
      case 'down':
        isWon = currentPrice < bet.entryPrice;
        break;
      case 'target':
        if (bet.targetPrice) {
          const targetReached = bet.targetPrice > bet.entryPrice 
            ? currentPrice >= bet.targetPrice
            : currentPrice <= bet.targetPrice;
          isWon = targetReached;
        }
        break;
      case 'range':
        if (bet.targetRange) {
          isWon = currentPrice >= bet.targetRange.min && currentPrice <= bet.targetRange.max;
        }
        break;
    }

    return {
      ...bet,
      status: isWon ? 'won' : 'lost',
      actualPayout: isWon ? bet.potentialPayout : 0,
      settledAt: new Date()
    };
  };

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date();
    const diff = new Date(expiryTime).getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getCurrentPrice = (symbol: string) => {
    const stock = realTimeData.find(s => s.symbol === symbol);
    return stock ? stock.price : 0;
  };

  const getPnL = (bet: Bet) => {
    const currentPrice = getCurrentPrice(bet.stockSymbol);
    if (!currentPrice) return 0;
    
    const priceChange = currentPrice - bet.entryPrice;
    const percentChange = (priceChange / bet.entryPrice) * 100;
    
    let isWinning = false;
    switch (bet.betType) {
      case 'up':
        isWinning = currentPrice > bet.entryPrice;
        break;
      case 'down':
        isWinning = currentPrice < bet.entryPrice;
        break;
      case 'target':
        if (bet.targetPrice) {
          isWinning = bet.targetPrice > bet.entryPrice 
            ? currentPrice >= bet.targetPrice
            : currentPrice <= bet.targetPrice;
        }
        break;
      case 'range':
        if (bet.targetRange) {
          isWinning = currentPrice >= bet.targetRange.min && currentPrice <= bet.targetRange.max;
        }
        break;
    }
    
    return isWinning ? bet.potentialPayout - bet.amount : -bet.amount;
  };

  const getBetTypeIcon = (type: string) => {
    switch (type) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'target':
        return <Target className="h-4 w-4 text-purple-400" />;
      case 'range':
        return <Target className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Bets</h2>
          <p className="text-gray-400">Monitor your live betting positions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              autoRefresh 
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh</span>
          </button>
          
          <button
            onClick={fetchRealTimeData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Active Bets */}
      {activeBets.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Bets</h3>
          <p className="text-gray-400">
            You don't have any active bets. Go to the betting section to place your first bet!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeBets.map((bet) => {
            const currentPrice = getCurrentPrice(bet.stockSymbol);
            const pnl = getPnL(bet);
            const timeRemaining = getTimeRemaining(bet.expiryTime);
            const isExpiringSoon = new Date(bet.expiryTime).getTime() - new Date().getTime() < 60000; // 1 minute
            
            return (
              <div
                key={bet.id}
                className={`bg-gray-800 rounded-xl border p-6 transition-all ${
                  isExpiringSoon ? 'border-yellow-500 bg-yellow-500/5' : 'border-gray-700'
                }`}
              >
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Bet Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {bet.stockSymbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{bet.stockSymbol}</div>
                        <div className="text-sm text-gray-400">{bet.stockName}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getBetTypeIcon(bet.betType)}
                      <span className="text-sm capitalize">{bet.betType}</span>
                      {bet.betType === 'target' && bet.targetPrice && (
                        <span className="text-xs text-gray-400">
                          → ${bet.targetPrice.toFixed(2)}
                        </span>
                      )}
                      {bet.betType === 'range' && bet.targetRange && (
                        <span className="text-xs text-gray-400">
                          ${bet.targetRange.min.toFixed(2)} - ${bet.targetRange.max.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-400">Entry Price</div>
                      <div className="font-medium">${bet.entryPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Current Price</div>
                      <div className="font-medium">${currentPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* P&L and Amount */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-400">Bet Amount</div>
                      <div className="font-medium">${bet.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Unrealized P&L</div>
                      <div className={`font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Time and Status */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-400">Time Remaining</div>
                      <div className={`font-medium flex items-center space-x-1 ${
                        isExpiringSoon ? 'text-yellow-400' : 'text-white'
                      }`}>
                        <Clock className="h-4 w-4" />
                        <span>{timeRemaining}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Potential Payout</div>
                      <div className="font-medium text-emerald-400">
                        ${bet.potentialPayout.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {isExpiringSoon && (
                  <div className="mt-4 flex items-center space-x-2 text-yellow-400 bg-yellow-500/10 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">This bet expires in less than 1 minute!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time Market Data */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Real-Time Market Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {realTimeData.slice(0, 8).map((stock) => (
            <div key={stock.symbol} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{stock.symbol}</span>
                <span className={`text-sm ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-xl font-bold">${stock.price.toFixed(2)}</div>
              <div className="text-sm text-gray-400">
                Vol: {(stock.volume / 1000000).toFixed(1)}M
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveBetting;