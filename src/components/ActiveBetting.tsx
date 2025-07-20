import React, { useState, useEffect } from 'react';
import { Bet, User } from '../types';

interface ActiveBettingProps {
  user: User;
  onBetUpdate: () => void;
}

// Mock data
const mockBets: Bet[] = [
  {
    id: 'bet1',
    userId: 'demo',
    symbol: 'AAPL',
    type: 'up',
    amount: 1000,
    status: 'active',
    placedAt: new Date().toISOString(),
    expiry: new Date(Date.now() + 3600000).toISOString(),
    odds: 1.85,
    payout: 1850,
    result: null,
  },
  {
    id: 'bet2',
    userId: 'demo',
    symbol: 'TSLA',
    type: 'down',
    amount: 500,
    status: 'active',
    placedAt: new Date().toISOString(),
    expiry: new Date(Date.now() + 7200000).toISOString(),
    odds: 2.1,
    payout: 1050,
    result: null,
  },
];

const mockRealTimeData = [
  { symbol: 'AAPL', price: 192.5, change: 1.2 },
  { symbol: 'TSLA', price: 720.1, change: -2.3 },
];

const ActiveBetting: React.FC<ActiveBettingProps> = ({ user, onBetUpdate }) => {
  const [activeBets, setActiveBets] = useState<Bet[]>(mockBets);
  const [realTimeData, setRealTimeData] = useState<any[]>(mockRealTimeData);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulate real-time data update
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRealTimeData((prev) =>
        prev.map((d) => ({ ...d, price: +(d.price + (Math.random() - 0.5) * 2).toFixed(2) }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Simulate bet settlement
  const settleBet = (betId: string, result: 'win' | 'lose') => {
    setActiveBets((prev) =>
      prev.map((bet) =>
        bet.id === betId ? { ...bet, status: 'settled', result } : bet
      )
    );
    onBetUpdate();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Bets</h2>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm font-medium">
            Real-time Data {autoRefresh ? '(On)' : '(Off)'}
          </span>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeBets.map((bet) => (
          <div key={bet.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">{bet.symbol}</div>
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">{bet.type.toUpperCase()}</span>
            </div>
            <div className="text-gray-400 text-sm mb-2">Amount: ₹{bet.amount}</div>
            <div className="text-gray-400 text-sm mb-2">Odds: {bet.odds}</div>
            <div className="text-gray-400 text-sm mb-2">Potential Payout: ₹{bet.payout}</div>
            <div className="text-gray-400 text-sm mb-2">Expiry: {new Date(bet.expiry).toLocaleTimeString()}</div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => settleBet(bet.id, 'win')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm"
                disabled={bet.status === 'settled'}
              >
                Settle as Win
              </button>
              <button
                onClick={() => settleBet(bet.id, 'lose')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                disabled={bet.status === 'settled'}
              >
                Settle as Lose
              </button>
            </div>
            {bet.status === 'settled' && (
              <div className={`mt-2 text-sm font-bold ${bet.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                {bet.result === 'win' ? 'You Won!' : 'You Lost'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveBetting;