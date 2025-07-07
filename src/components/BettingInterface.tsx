import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3, Zap, AlertCircle } from 'lucide-react';
import { MarketData, User, Bet } from '../types';

interface BettingInterfaceProps {
  marketData: MarketData;
  user: User;
  onBetPlaced: () => void;
}

const BettingInterface: React.FC<BettingInterfaceProps> = ({ marketData, user, onBetPlaced }) => {
  const [selectedStock, setSelectedStock] = useState(marketData.stocks[0]);
  const [betType, setBetType] = useState<'up' | 'down' | 'target' | 'range'>('up');
  const [betAmount, setBetAmount] = useState(100);
  const [targetPrice, setTargetPrice] = useState(selectedStock.price * 1.05);
  const [targetRange, setTargetRange] = useState({
    min: selectedStock.price * 0.98,
    max: selectedStock.price * 1.02
  });
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update target price when stock changes
  useEffect(() => {
    setTargetPrice(selectedStock.price * 1.05);
    setTargetRange({
      min: selectedStock.price * 0.98,
      max: selectedStock.price * 1.02
    });
  }, [selectedStock]);

  const calculateOdds = () => {
    const volatilityFactor = Math.abs(selectedStock.changePercent) / 100;
    const timeFactor = expiryMinutes / 60;
    const exchangeFactor = selectedStock.exchange === 'NASDAQ' ? 1.1 : 
                          selectedStock.exchange === 'NSE' ? 1.2 : 1.15;
    
    let baseOdds = 1.85;
    
    switch (betType) {
      case 'target':
        const targetDiff = Math.abs(targetPrice - selectedStock.price) / selectedStock.price;
        baseOdds = 2.5 + (targetDiff * 10);
        break;
      case 'range':
        const rangeSize = (targetRange.max - targetRange.min) / selectedStock.price;
        baseOdds = 1.5 + (1 / rangeSize);
        break;
      default:
        baseOdds = 1.85;
    }
    
    return Math.max(1.1, baseOdds + volatilityFactor + (timeFactor * 0.1) + (exchangeFactor - 1));
  };

  const calculatePayout = () => {
    return betAmount * calculateOdds();
  };

  const getRiskLevel = () => {
    const odds = calculateOdds();
    if (odds > 3) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (odds > 2) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  };

  const handlePlaceBet = () => {
    if (betAmount > user.balance) return;

    const bet: Bet = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      stockSymbol: selectedStock.symbol,
      stockName: selectedStock.name,
      betType,
      amount: betAmount,
      entryPrice: selectedStock.price,
      targetPrice: betType === 'target' ? targetPrice : undefined,
      targetRange: betType === 'range' ? targetRange : undefined,
      expiryTime: new Date(Date.now() + expiryMinutes * 60 * 1000),
      status: 'active',
      potentialPayout: calculatePayout(),
      odds: calculateOdds(),
      createdAt: new Date(),
    };

    // Store bet in localStorage (in real app, would send to backend)
    const existingBets = JSON.parse(localStorage.getItem('bets') || '[]');
    localStorage.setItem('bets', JSON.stringify([...existingBets, bet]));

    // Update user balance
    const updatedUser = { ...user, balance: user.balance - betAmount };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    onBetPlaced();
  };

  const risk = getRiskLevel();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Stock Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Choose Stock</h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {showAdvanced ? 'Simple View' : 'Advanced View'}
            </button>
          </div>
          
          <div className="grid gap-4">
            {marketData.stocks.slice(0, showAdvanced ? 12 : 6).map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                  selectedStock.symbol === stock.symbol
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center font-bold">
                      {stock.symbol.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-400">{stock.name}</div>
                      {showAdvanced && (
                        <div className="text-xs text-gray-500 mt-1">
                          {stock.exchange} • {stock.sector}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${stock.price.toFixed(2)}</div>
                    <div className={`text-sm ${
                      stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    {showAdvanced && (
                      <div className="text-xs text-gray-500 mt-1">
                        Vol: {(stock.volume / 1000000).toFixed(1)}M
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Betting Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-fit">
        <h2 className="text-xl font-semibold mb-6">Place Your Bet</h2>
        
        {/* Selected Stock Info */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 rounded-lg mb-6 border border-gray-600">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center font-bold">
              {selectedStock.symbol.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{selectedStock.symbol}</div>
              <div className="text-sm text-gray-400">{selectedStock.name}</div>
              <div className="text-xs text-gray-500">{selectedStock.exchange}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Current Price</div>
              <div className="text-xl font-bold">${selectedStock.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400">24h Change</div>
              <div className={`text-lg font-semibold ${
                selectedStock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Bet Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Bet Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBetType('up')}
              className={`p-3 rounded-lg border transition-all ${
                betType === 'up'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
              <div className="text-xs">Bull (Up)</div>
            </button>
            <button
              onClick={() => setBetType('down')}
              className={`p-3 rounded-lg border transition-all ${
                betType === 'down'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <TrendingDown className="h-5 w-5 mx-auto mb-1 text-red-400" />
              <div className="text-xs">Bear (Down)</div>
            </button>
            <button
              onClick={() => setBetType('target')}
              className={`p-3 rounded-lg border transition-all ${
                betType === 'target'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <Target className="h-5 w-5 mx-auto mb-1 text-purple-400" />
              <div className="text-xs">Target Price</div>
            </button>
            <button
              onClick={() => setBetType('range')}
              className={`p-3 rounded-lg border transition-all ${
                betType === 'range'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <div className="text-xs">Price Range</div>
            </button>
          </div>
        </div>

        {/* Target Price (only for target bets) */}
        {betType === 'target' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Price</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              step="0.01"
            />
            <div className="text-xs text-gray-400 mt-1">
              {((targetPrice - selectedStock.price) / selectedStock.price * 100).toFixed(2)}% from current price
            </div>
          </div>
        )}

        {/* Price Range (only for range bets) */}
        {betType === 'range' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  value={targetRange.min}
                  onChange={(e) => setTargetRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  placeholder="Min"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={targetRange.max}
                  onChange={(e) => setTargetRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Range size: {(((targetRange.max - targetRange.min) / selectedStock.price) * 100).toFixed(2)}%
            </div>
          </div>
        )}

        {/* Bet Amount */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="10"
              max={user.balance}
            />
          </div>
          <div className="flex space-x-2 mt-2">
            {[50, 100, 500, 1000].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, user.balance))}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                disabled={amount > user.balance}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Time */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={240}>4 hours</option>
              <option value={1440}>1 day</option>
            </select>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className={`p-3 rounded-lg mb-6 ${risk.bg} border border-gray-600`}>
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className={`h-4 w-4 ${risk.color}`} />
            <span className="text-sm font-medium">Risk Level: <span className={risk.color}>{risk.level}</span></span>
          </div>
          <div className="text-xs text-gray-400">
            Based on volatility, time frame, and bet type
          </div>
        </div>

        {/* Bet Summary */}
        <div className="bg-gray-700 p-4 rounded-lg mb-6 border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Odds</span>
            <span className="font-medium">{calculateOdds().toFixed(2)}x</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Potential Payout</span>
            <span className="font-medium text-emerald-400">${calculatePayout().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Potential Profit</span>
            <span className="font-medium text-emerald-400">
              ${(calculatePayout() - betAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={betAmount > user.balance || betAmount < 10}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed font-medium rounded-lg transition-all transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          <Zap className="h-5 w-5" />
          <span>Place Bet - ${betAmount}</span>
        </button>
        
        {betAmount > user.balance && (
          <div className="text-red-400 text-sm mt-2 text-center">
            Insufficient balance. Available: ${user.balance.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingInterface;