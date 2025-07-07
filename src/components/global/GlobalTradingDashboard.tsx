import React, { useState, useEffect } from 'react';
import { Globe, Clock, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { User, GlobalMarket, CurrencyRate } from '../../types';
import { globalTradingService } from '../../services/globalTradingService';
import CurrencyConverter from './CurrencyConverter';
import GlobalMarketCard from './GlobalMarketCard';
import toast from 'react-hot-toast';

interface GlobalTradingDashboardProps {
  user: User;
}

const GlobalTradingDashboard: React.FC<GlobalTradingDashboardProps> = ({ user }) => {
  const [globalMarkets, setGlobalMarkets] = useState<GlobalMarket[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [globalPortfolio, setGlobalPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<string>('');

  useEffect(() => {
    loadGlobalTradingData();
  }, [user.id]);

  const loadGlobalTradingData = async () => {
    setLoading(true);
    try {
      const [markets, rates, portfolio] = await Promise.all([
        globalTradingService.getGlobalMarkets(),
        globalTradingService.getCurrencyRates(),
        globalTradingService.getGlobalPortfolio(user.id)
      ]);

      setGlobalMarkets(markets);
      setCurrencyRates(rates);
      setGlobalPortfolio(portfolio);
    } catch (error) {
      console.error('Error loading global trading data:', error);
      toast.error('Failed to load global trading data');
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalTrade = async (symbol: string, exchange: string, amount: number, currency: string) => {
    const result = await globalTradingService.placeGlobalTrade(symbol, exchange, amount, currency);
    
    if (result.success) {
      toast.success('Global trade placed successfully!');
      loadGlobalTradingData();
    } else {
      toast.error(result.error || 'Failed to place global trade');
    }
  };

  const getMarketStatusColor = (isOpen: boolean) => {
    return isOpen ? 'text-emerald-400' : 'text-red-400';
  };

  const getMarketStatusText = (isOpen: boolean) => {
    return isOpen ? 'Open' : 'Closed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Global Trading</h2>
          <p className="text-gray-400">Trade stocks from international markets</p>
        </div>
        
        <button
          onClick={loadGlobalTradingData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Portfolio Summary */}
      {globalPortfolio && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Global Portfolio Value</div>
              <div className="text-3xl font-bold">₹{globalPortfolio.totalValueINR.toLocaleString()}</div>
            </div>
            <Globe className="h-12 w-12 opacity-80" />
          </div>
        </div>
      )}

      {/* Currency Converter */}
      <CurrencyConverter currencyRates={currencyRates} />

      {/* Global Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {globalMarkets.map((market) => (
          <GlobalMarketCard
            key={market.exchange}
            market={market}
            onTrade={handleGlobalTrade}
            userBalance={user.balance}
          />
        ))}
      </div>

      {/* Market Hours */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Market Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalMarkets.map((market) => (
            <div key={market.exchange} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{market.exchange}</div>
                <div className={`text-sm font-medium ${getMarketStatusColor(market.isOpen)}`}>
                  {getMarketStatusText(market.isOpen)}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                <div>{market.openTime} - {market.closeTime} {market.timezone}</div>
                <div className="mt-1">{market.region}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Currency Rates */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Live Currency Rates</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {currencyRates.map((rate) => (
            <div key={`${rate.from}-${rate.to}`} className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-400 mb-1">
                {rate.from}/{rate.to}
              </div>
              <div className="text-lg font-bold">
                ₹{rate.rate.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {rate.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Portfolio Breakdown */}
      {globalPortfolio && globalPortfolio.portfolioByExchange && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio by Exchange</h3>
          <div className="grid gap-4">
            {globalPortfolio.portfolioByExchange.map((portfolio: any) => (
              <div key={portfolio.exchange} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{portfolio.exchange}</div>
                    <div className="text-sm text-gray-400">Currency: {portfolio.currency}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {portfolio.currency} {portfolio.currentValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      Invested: {portfolio.currency} {portfolio.totalInvested.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="text-sm text-blue-400">
          <strong>Global Trading Notes:</strong>
          <ul className="mt-2 space-y-1 text-blue-300">
            <li>• Currency conversion happens at real-time rates</li>
            <li>• International trades may have additional fees</li>
            <li>• Market hours vary by timezone</li>
            <li>• Some markets may be closed on local holidays</li>
            <li>• Settlement times may vary by exchange</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GlobalTradingDashboard;