import React, { useState } from 'react';
import { Clock, TrendingUp, DollarSign, Globe } from 'lucide-react';
import { GlobalMarket } from '../../types';

interface GlobalMarketCardProps {
  market: GlobalMarket;
  onTrade: (symbol: string, exchange: string, amount: number, currency: string) => void;
  userBalance: number;
}

const GlobalMarketCard: React.FC<GlobalMarketCardProps> = ({ market, onTrade, userBalance }) => {
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeAmount, setTradeAmount] = useState('1000');
  const [selectedSymbol, setSelectedSymbol] = useState('');

  // Mock popular stocks for each exchange
  const getPopularStocks = (exchange: string) => {
    const stocks = {
      'NYSE': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
      'NASDAQ': ['NVDA', 'META', 'NFLX', 'ADBE', 'INTC'],
      'LSE': ['SHEL', 'AZN', 'BP', 'HSBA', 'VOD'],
      'TSE': ['7203', '6758', '9984', '8306', '6861'],
      'HKEX': ['0700', '0941', '0005', '1299', '2318'],
      'NSE': ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK']
    };
    return stocks[exchange as keyof typeof stocks] || [];
  };

  const handleTrade = () => {
    if (!selectedSymbol || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    if (amount <= 0) return;

    onTrade(selectedSymbol, market.exchange, amount, market.currency);
    setShowTradeForm(false);
    setTradeAmount('1000');
    setSelectedSymbol('');
  };

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? 'text-emerald-400' : 'text-red-400';
  };

  const popularStocks = getPopularStocks(market.exchange);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{market.exchange}</h3>
          <div className="text-sm text-gray-400">{market.region}</div>
        </div>
        <div className={`text-sm font-medium ${getStatusColor(market.isOpen)}`}>
          {market.isOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Trading Hours:</span>
          <span>{market.openTime} - {market.closeTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Timezone:</span>
          <span>{market.timezone}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Currency:</span>
          <span>{market.currency}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Major Indices:</div>
        <div className="flex flex-wrap gap-1">
          {market.indices.map((index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-xs rounded"
            >
              {index}
            </span>
          ))}
        </div>
      </div>

      {!showTradeForm ? (
        <button
          onClick={() => setShowTradeForm(true)}
          disabled={!market.isOpen}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
        >
          {market.isOpen ? 'Trade Now' : 'Market Closed'}
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stock Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a stock</option>
              {popularStocks.map((symbol) => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount ({market.currency})
            </label>
            <input
              type="number"
              value={tradeAmount}
              onChange={(e) => setTradeAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
              min="1"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowTradeForm(false)}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleTrade}
              disabled={!selectedSymbol || !tradeAmount}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors text-sm"
            >
              Place Trade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalMarketCard;