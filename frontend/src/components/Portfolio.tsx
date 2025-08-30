import React, { useState } from 'react';
import { User } from '../types';

interface PortfolioProps {
  user: User;
}

// Mock data
const mockHoldings = [
  { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 192.5 },
  { symbol: 'TSLA', shares: 5, avgPrice: 700, currentPrice: 720.1 },
  { symbol: 'RELIANCE', shares: 20, avgPrice: 2200, currentPrice: 2450 },
];

const mockHistory = [
  { id: 'h1', symbol: 'AAPL', type: 'buy', shares: 10, price: 150, date: new Date().toLocaleDateString() },
  { id: 'h2', symbol: 'TSLA', type: 'buy', shares: 5, price: 700, date: new Date().toLocaleDateString() },
  { id: 'h3', symbol: 'RELIANCE', type: 'buy', shares: 20, price: 2200, date: new Date().toLocaleDateString() },
];

const Portfolio: React.FC<PortfolioProps> = ({ user }) => {
  const [holdings] = useState(mockHoldings);
  const [history] = useState(mockHistory);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {holdings.map((h) => (
          <div key={h.symbol} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="font-semibold text-lg mb-2">{h.symbol}</div>
            <div className="text-gray-400 text-sm mb-2">Shares: {h.shares}</div>
            <div className="text-gray-400 text-sm mb-2">Avg. Buy Price: ₹{h.avgPrice}</div>
            <div className="text-gray-400 text-sm mb-2">Current Price: ₹{h.currentPrice}</div>
            <div className="text-gray-400 text-sm mb-2">P/L: <span className={h.currentPrice > h.avgPrice ? 'text-emerald-400' : 'text-red-400'}>₹{((h.currentPrice - h.avgPrice) * h.shares).toFixed(2)}</span></div>
          </div>
        ))}
      </div>
      <h3 className="text-xl font-semibold mt-8">Trade History</h3>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Symbol</th>
              <th className="py-2">Type</th>
              <th className="py-2">Shares</th>
              <th className="py-2">Price</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-t border-gray-700">
                <td className="py-2">{h.symbol}</td>
                <td className="py-2 capitalize">{h.type}</td>
                <td className="py-2">{h.shares}</td>
                <td className="py-2">₹{h.price}</td>
                <td className="py-2">{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;