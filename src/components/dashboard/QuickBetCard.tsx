import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { usePlaceBet, useWallet } from '@/hooks/useBetting';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';
import type { LiveStock } from '@/lib/market-api';

interface QuickBetCardProps {
  selectedStock?: LiveStock | null;
}

const DEFAULT_SYMBOL = 'AAPL';
const DEFAULT_NAME = 'Apple Inc.';
const DEFAULT_MARKET = 'US';

const QuickBetCard = ({ selectedStock }: QuickBetCardProps) => {
  const [betType, setBetType] = useState<'long' | 'short'>('long');
  const [stake, setStake] = useState('100');
  const [expiry, setExpiry] = useState('1h');
  const { mutate: placeBet, isPending } = usePlaceBet();
  const { data: wallet } = useWallet();

  const symbol = selectedStock?.symbol ?? DEFAULT_SYMBOL;
  const stockName = selectedStock?.name ?? DEFAULT_NAME;
  const market = selectedStock?.market ?? DEFAULT_MARKET;

  // Always fetch real-time price for the selected symbol
  const { data: prices = {}, isFetching } = useRealtimePrices([symbol]);
  const livePrice = prices[symbol] ?? selectedStock?.price ?? 0;

  const balance = wallet != null ? Number(wallet.balance) : 0;
  const stakeNum = Number(stake);
  const payout = stakeNum * 1.85;

  const handlePlaceBet = () => {
    if (stakeNum <= 0 || stakeNum > balance || livePrice <= 0) return;
    placeBet({ symbol, stockName, market, betType, stake: stakeNum, entryPrice: livePrice, expiry });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Quick Bet</h3>
          <div className="flex items-center gap-1.5">
            {isFetching && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
            <span className="text-xs text-primary font-mono animate-pulse">● LIVE</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground">{symbol} — {stockName}</p>
          <p className="text-sm font-mono font-bold text-foreground">
            ₹{livePrice > 0 ? livePrice.toLocaleString('en-IN') : '—'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Long / Short */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBetType('long')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              betType === 'long'
                ? 'bg-gain text-gain-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> LONG
          </button>
          <button
            onClick={() => setBetType('short')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              betType === 'short'
                ? 'bg-loss text-loss-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" /> SHORT
          </button>
        </div>

        {/* Stake */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Stake{' '}
            <span className="text-primary">
              (Available: ₹{balance.toLocaleString('en-IN')})
            </span>
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

        {/* Expiry */}
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

        {/* Summary */}
        <div className="bg-muted rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-mono text-foreground">₹{livePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Expected Payout</span>
            <span className="font-mono text-gain">₹{payout.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Max Risk</span>
            <span className="font-mono text-loss">₹{stake}</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceBet}
          disabled={isPending || stakeNum <= 0 || stakeNum > balance || livePrice <= 0}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            betType === 'long'
              ? 'bg-gain text-gain-foreground hover:brightness-110'
              : 'bg-loss text-loss-foreground hover:brightness-110'
          }`}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isPending ? 'Placing...' : `Place ${betType.toUpperCase()} — ₹${stake}`}
        </motion.button>

        <div className="flex items-start gap-2 text-xs text-warning/80">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Dummy wallet. Real-time stock prices. No real money involved.</span>
        </div>
      </div>
    </div>
  );
};

export default QuickBetCard;
