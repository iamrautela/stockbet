import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/pages/Dashboard';
import MarketsPage from '@/components/pages/MarketsPage';
import PositionsPage from '@/components/pages/PositionsPage';
import HistoryPage from '@/components/pages/HistoryPage';
import WalletPage from '@/components/pages/WalletPage';
import IPOPage from '@/components/pages/IPOPage';
import QuantPage from '@/components/pages/QuantPage';
import PlaceholderPage from '@/components/pages/PlaceholderPage';
import SettingsPage from '@/components/pages/SettingsPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [activeMarket, setActiveMarket] = useState('US');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <DashboardPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard activeMarket={activeMarket} />;
      case 'markets': return <MarketsPage activeMarket={activeMarket} />;
      case 'positions': return <PositionsPage />;
      case 'history': return <HistoryPage />;
      case 'wallet': return <WalletPage />;
      case 'ipo': return <IPOPage />;
      case 'quant': return <QuantPage />;
      case 'compliance': return <PlaceholderPage title="Risk & Compliance" />;
      case 'help': return <PlaceholderPage title="Help Center" />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard activeMarket={activeMarket} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeMarket={activeMarket} onMarketChange={setActiveMarket} />
      <div className="flex">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto h-[calc(100vh-3.5rem)]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
