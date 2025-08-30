import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Globe, Clock, Activity } from 'lucide-react';
import { MarketData } from '../types';
import { calculateMarketSentiment, generateMarketNews } from '../utils/mockData';

interface MarketOverviewProps {
  marketData: MarketData;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ marketData }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedExchange, setSelectedExchange] = useState<string>('all');
  
  const sentiment = calculateMarketSentiment(marketData.stocks);
  const marketNews = generateMarketNews();
  
  const filteredStocks = marketData.stocks.filter(stock => {
    if (selectedExchange !== 'all' && stock.exchange !== selectedExchange) return false;
    if (selectedRegion !== 'all') {
      const regionMap: { [key: string]: string[] } = {
        'US': ['NASDAQ'],
        'India': ['NSE', 'BSE'],
        'Hong Kong': ['HKEX']
      };
      if (!regionMap[selectedRegion]?.includes(stock.exchange)) return false;
    }
    return true;
  });

  const regions = ['all', 'US', 'India', 'Hong Kong'];
  const exchanges = ['all', 'NASDAQ', 'NSE', 'BSE', 'HKEX'];

  return (
    <div className="space-y-8">
      {/* Market Status Bar */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-emerald-400" />
            <div>
              <div className="text-sm text-gray-400">Market Sentiment</div>
              <div className={`text-lg font-bold ${sentiment.color}`}>
                {sentiment.sentiment} ({sentiment.score.toFixed(1)}%)
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Active Markets</div>
              <div className="text-lg font-bold">3 Regions</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-lg font-bold">
                {marketData.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-yellow-400" />
            <div>
              <div className="text-sm text-gray-400">Market News</div>
              <div className="text-sm font-medium text-yellow-400 truncate">
                {marketNews}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {marketData.indices.map((index) => (
          <div key={index.name} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-300 text-sm">{index.name}</h3>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                {index.region}
              </span>
            </div>
            <div className="text-xl font-bold mb-1">
              {index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center space-x-1 ${
              index.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {index.change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Region:</span>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {region === 'all' ? 'All' : region}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Exchange:</span>
            {exchanges.map((exchange) => (
              <button
                key={exchange}
                onClick={() => setSelectedExchange(exchange)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedExchange === exchange
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {exchange === 'all' ? 'All' : exchange}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          Showing {filteredStocks.length} of {marketData.stocks.length} stocks
        </div>
      </div>

      {/* Stock List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Live Stock Prices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-300">Symbol</th>
                <th className="text-left py-3 px-6 font-medium text-gray-300">Name</th>
                <th className="text-right py-3 px-6 font-medium text-gray-300">Price</th>
                <th className="text-right py-3 px-6 font-medium text-gray-300">Change</th>
                <th className="text-right py-3 px-6 font-medium text-gray-300">Day Range</th>
                <th className="text-right py-3 px-6 font-medium text-gray-300">Volume</th>
                <th className="text-right py-3 px-6 font-medium text-gray-300">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                        {stock.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-gray-500">{stock.exchange}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-gray-300">{stock.name}</div>
                      <div className="text-xs text-gray-500">{stock.sector}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-medium">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`py-4 px-6 text-right ${
                    stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    <div className="flex items-center justify-end space-x-1">
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <div>
                        <div className="font-medium">
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </div>
                        <div className="text-xs">
                          ({stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-gray-300 text-sm">
                    <div>${stock.dayLow.toFixed(2)}</div>
                    <div className="text-gray-500">-</div>
                    <div>${stock.dayHigh.toFixed(2)}</div>
                  </td>
                  <td className="py-4 px-6 text-right text-gray-300">
                    {(stock.volume / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-4 px-6 text-right text-gray-300">{stock.marketCap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;