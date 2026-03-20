import { useState } from 'react';
import StatsBar from '@/components/dashboard/StatsBar';
import MarketTicker from '@/components/dashboard/MarketTicker';
import PositionsPanel from '@/components/dashboard/PositionsPanel';
import QuickBetCard from '@/components/dashboard/QuickBetCard';
import IPOPreview from '@/components/dashboard/IPOPreview';
import type { LiveStock } from '@/lib/market-api';

interface DashboardProps {
  activeMarket: string;
}

const Dashboard = ({ activeMarket }: DashboardProps) => {
  const [selectedStock, setSelectedStock] = useState<LiveStock | null>(null);

  return (
    <div className="space-y-4 animate-fade-in">
      <StatsBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <MarketTicker market={activeMarket} onSelectStock={setSelectedStock} />
          <PositionsPanel />
        </div>
        <div className="space-y-4">
          <QuickBetCard selectedStock={selectedStock} />
          <IPOPreview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
