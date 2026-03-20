import { Search, Wallet, User, TrendingUp, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { marketFlags } from '@/lib/mock-data';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface TopNavProps {
  activeMarket: string;
  onMarketChange: (market: string) => void;
}

const markets = ['US', 'IN', 'HK'] as const;

const TopNav = ({ activeMarket, onMarketChange }: TopNavProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const { wallet } = useWallet();
  const { signOut, user } = useAuth();
  const balance = wallet ? Number(wallet.balance) + Number(wallet.in_bets) : 0;

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">StockBet</span>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-4 bg-muted rounded-lg p-0.5">
          {markets.map((m) => (
            <button
              key={m}
              onClick={() => onMarketChange(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeMarket === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {marketFlags[m]} {m}
            </button>
          ))}
        </div>
      </div>

      <div className={`relative hidden md:block transition-all ${searchFocused ? 'w-80' : 'w-64'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stocks, IPOs..."
          className="w-full bg-muted border-none rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground">
            ₹{balance.toLocaleString()}
          </span>
        </div>
        <NotificationBell />
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center" title={user?.email || ''}>
            <User className="w-4 h-4 text-primary" />
          </div>
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Sign out">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
