import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import StatsBar from '@/components/dashboard/StatsBar';
import MarketTicker from '@/components/dashboard/MarketTicker';
import PositionsPanel from '@/components/dashboard/PositionsPanel';
import QuickBetCard from '@/components/dashboard/QuickBetCard';
import IPOPreview from '@/components/dashboard/IPOPreview';
import { Fireworks } from '@/components/ui/Fireworks';
import { useOpenBets, useBetHistory } from '@/hooks/useBetting';
import type { LiveStock } from '@/lib/market-api';

interface DashboardProps {
  activeMarket: string;
}

const Dashboard = ({ activeMarket }: DashboardProps) => {
  const [selectedStock, setSelectedStock] = useState<LiveStock | null>(null);
  const [fireworks, setFireworks] = useState(false);
  const { data: openBets = [], isLoading: openLoading } = useOpenBets();
  const { data: history = [], isLoading: histLoading } = useBetHistory();

  const seenWins = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!history?.length) return;
    const newWins = (history as any[]).filter(
      (t) => t.status === 'won' && !seenWins.current.has(t.id)
    );
    if (newWins.length > 0) {
      newWins.forEach((t) => seenWins.current.add(t.id));
      setFireworks(true);
      setTimeout(() => setFireworks(false), 3500);
    } else {
      (history as any[]).forEach((t) => {
        if (t.status === 'won') seenWins.current.add(t.id);
      });
    }
  }, [history]);

  const noActivity =
    !openLoading &&
    !histLoading &&
    (openBets?.length ?? 0) === 0 &&
    (history?.length ?? 0) === 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <Fireworks active={fireworks} />

      {noActivity && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Welcome to your dashboard</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any stock in the market ticker, then place a bet. Prices update every 15 seconds from live market data.
            </p>
          </div>
        </div>
      )}

      <StatsBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <MarketTicker market={activeMarket} onSelectStock={setSelectedStock} />
          <PositionsPanel />
        </div>
        <div className="space-y-4">
          <QuickBetCard selectedStock={selectedStock} />
          {!noActivity && <IPOPreview />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
