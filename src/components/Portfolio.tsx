import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, Eye } from 'lucide-react';
import { User, Bet } from '../types';

interface PortfolioProps {
  user: User;
}

const Portfolio: React.FC<PortfolioProps> = ({ user }) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');

  useEffect(() => {
    const storedBets = JSON.parse(localStorage.getItem('bets') || '[]');
    const userBets = storedBets.filter((bet: Bet) => bet.userId === user.id);
    setBets(userBets);
  }, [user.id]);

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true;
    return bet.status === filter;
  });

  const stats = {
    totalBets: bets.length,
    activeBets: bets.filter(bet => bet.status === 'active').length,
    wonBets: bets.filter(bet => bet.status === 'won').length,
    totalWinnings: bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + bet.potentialPayout, 0),
    totalStaked: bets.reduce((sum, bet) => sum + bet.amount, 0),
  };

  const getBetTypeIcon = (type: string) => {
    switch (type) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'target':
        return <Target className="h-4 w-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-400';
      case 'won':
        return 'text-emerald-400';
      case 'lost':
        return 'text-red-400';
      case 'expired':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTimeRemaining = (expiryTime: Date) => {
    const now = new Date();
    const diff = new Date(expiryTime).getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Total Bets</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalBets}</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Active Bets</h3>
            <Clock className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.activeBets}</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Won Bets</h3>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.wonBets}</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Total Staked</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">${stats.totalStaked.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Total Winnings</h3>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${stats.totalWinnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bet History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Bet History</h2>
            <div className="flex space-x-2">
              {(['all', 'active', 'won', 'lost'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredBets.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-xl mb-2">No bets found</div>
              <div>Start betting to see your portfolio here</div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-300">Stock</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-300">Type</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-300">Amount</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-300">Entry Price</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-300">Target</th>
                  <th className="text-right py-3 px-6 font-medium text-gray-300">Payout</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Status</th>
                  <th className="text-center py-3 px-6 font-medium text-gray-300">Time Left</th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => (
                  <tr key={bet.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {bet.stockSymbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{bet.stockSymbol}</div>
                          <div className="text-sm text-gray-400">{bet.stockName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getBetTypeIcon(bet.betType)}
                        <span className="capitalize">{bet.betType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium">${bet.amount}</td>
                    <td className="py-4 px-6 text-right">${bet.entryPrice.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right">
                      {bet.targetPrice ? `$${bet.targetPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-emerald-400">
                      ${bet.potentialPayout.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                        {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-300">
                      {bet.status === 'active' ? getTimeRemaining(bet.expiryTime) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;