import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Header from './Header';
import MarketOverview from './MarketOverview';
import BettingInterface from './BettingInterface';
import Portfolio from './Portfolio';
import ActiveBetting from './ActiveBetting';
import QuantAnalysis from './quant/QuantAnalysis';
import BankingDashboard from './banking/BankingDashboard';
import IPODashboard from './ipo/IPODashboard';
import GlobalTradingDashboard from './global/GlobalTradingDashboard';
import { generateMockData } from '../utils/mockData';
import { marketDataService } from '../services/marketData';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'markets' | 'betting' | 'active' | 'portfolio' | 'quant' | 'banking' | 'ipo' | 'global'>('markets');
  const [marketData, setMarketData] = useState(generateMockData());
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Update market data
  useEffect(() => {
    const updateData = async () => {
      if (realTimeEnabled) {
        try {
          const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
          const realData = await marketDataService.fetchYahooFinanceData(symbols);
          
          if (realData.length > 0) {
            setMarketData(prev => ({
              ...prev,
              stocks: realData,
              lastUpdated: new Date()
            }));
          }
        } catch (error) {
          console.error('Error fetching real-time data:', error);
          // Fallback to mock data
          setMarketData(generateMockData());
        }
      } else {
        setMarketData(generateMockData());
      }
    };

    updateData();
    const interval = setInterval(updateData, realTimeEnabled ? 5000 : 2000);
    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const handleBetUpdate = () => {
    // Refresh user data and switch to portfolio
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Update user state if needed
    }
  };

  const tabs = [
    { id: 'markets', label: 'Markets', description: 'Live market data and analysis' },
    { id: 'betting', label: 'Place Bets', description: 'Create new betting positions' },
    { id: 'active', label: 'Active Bets', description: 'Monitor live positions' },
    { id: 'portfolio', label: 'Portfolio', description: 'View your trading history' },
    { id: 'banking', label: 'Banking', description: 'Deposits and withdrawals' },
    { id: 'ipo', label: 'IPO Center', description: 'Invest in new offerings' },
    { id: 'global', label: 'Global Trading', description: 'Trade international markets' },
    { id: 'quant', label: 'Quant Analysis', description: 'Advanced analytics and strategies' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-2 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-lg font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="text-sm font-semibold">{tab.label}</div>
                <div className="text-xs opacity-75 mt-1 hidden md:block">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Data Toggle */}
        {(activeTab === 'markets' || activeTab === 'betting') && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeEnabled}
                  onChange={(e) => setRealTimeEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  realTimeEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="text-sm font-medium">
                  Real-time Data {realTimeEnabled ? '(Yahoo Finance)' : '(Demo Mode)'}
                </span>
              </label>
            </div>
            
            <div className="text-sm text-gray-400">
              Last updated: {marketData.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'markets' && <MarketOverview marketData={marketData} />}
        {activeTab === 'betting' && (
          <BettingInterface 
            marketData={marketData} 
            user={user}
            onBetPlaced={() => setActiveTab('active')}
          />
        )}
        {activeTab === 'active' && (
          <ActiveBetting 
            user={user}
            onBetUpdate={handleBetUpdate}
          />
        )}
        {activeTab === 'portfolio' && <Portfolio user={user} />}
        {activeTab === 'banking' && <BankingDashboard user={user} />}
        {activeTab === 'ipo' && <IPODashboard user={user} />}
        {activeTab === 'global' && <GlobalTradingDashboard user={user} />}
        {activeTab === 'quant' && <QuantAnalysis />}
      </div>
    </div>
  );
};

export default Dashboard;