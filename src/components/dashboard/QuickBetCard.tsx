import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { usePlaceBet, useWallet } from '@/hooks/useBetting';
import type { LiveStock } from '@/lib/market-api';

interface QuickBetCardProps {
  selectedStock?: LiveStock | null;
}

const QuickBetCard = ({ selectedStock }: QuickBetCardProps) => {
  const [betType, setBetType] = useState<'long' | 'short'>('long');
  const [stake, setStake] = useState('100');
  const [expiry, setExpiry] = useState('1h');
  const { mutate: placeBet, isPending } = usePlaceBet();
  const { data: wallet } = useWallet();

  const stock = selectedStock || { symbol: 'AAPL', name: 'Apple Inc.', price: 198.45, market: 'US' };
  // Use mock balance of ₹10,000 when wallet not loaded yet
  const balance = wallet ? Number(wallet.balance) : 10000;

  const handlePlaceBet = () => {
    const stakeNum = Number(stake);
    if (stakeNum <= 0 || stakeNum > balance) return;

    placeBet({
      symbol: stock.symbol,
      stockName: stock.name,
      market: stock.market,
      betType,
      stake: stakeNum,
      entryPrice: stock.price,
      expiry,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Quick Bet</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{stock.symbol} — ₹{stock.price.toLocaleString('en-IN')}</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBetType('long')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              betType === 'long' ? 'bg-gain text-gain-foreground glow-gain' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> LONG
          </button>
          <button
            onClick={() => setBetType('short')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              betType === 'short' ? 'bg-loss text-loss-foreground glow-loss' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" /> SHORT
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Stake Amount <span className="text-primary">(Available: ₹{balance.toLocaleString('en-IN')})</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full bg-muted rounded-lg pl-7 pr-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {['500', '1000', '2500', '5000'].map((v) => (
              <button
                key={v}
                onClick={() => setStake(v)}
                className={`flex-1 py-1 text-xs font-mono rounded transition-colors ${
                  stake === v ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                ₹{v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Expiry</label>
          <div className="flex gap-2">
            {['15m', '1h', '4h', 'EOD'].map((v) => (
              <button
                key={v}
                onClick={() => setExpiry(v)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-mono rounded-lg transition-colors ${
                  expiry === v ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3 h-3" /> {v}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Expected Payout</span>
            <span className="font-mono text-foreground">₹{(Number(stake) * 1.85).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Max Risk</span>
            <span className="font-mono text-loss">₹{stake}</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceBet}
          disabled={isPending || Number(stake) <= 0 || Number(stake) > balance}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            betType === 'long' ? 'bg-gain text-gain-foreground hover:brightness-110' : 'bg-loss text-loss-foreground hover:brightness-110'
          }`}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isPending ? 'Placing...' : `Place ${betType.toUpperCase()} Bet — ₹${stake}`}
        </motion.button>

        <div className="flex items-start gap-2 text-xs text-warning/80">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Virtual credits only. No real money involved. Past performance does not guarantee future results.</span>
        </div>
      </div>
    </div>
  );
};

export default QuickBetCard;
