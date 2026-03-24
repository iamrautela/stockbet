import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Loader2, TrendingUp } from 'lucide-react';
import { useOpenBets } from '@/hooks/useBetting';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';

const PositionsPanel = () => {
  const { data: bets, isLoading } = useOpenBets();

  const symbols = [...new Set((bets || []).map((b: any) => b.symbol as string))];
  const { data: prices = {} } = useRealtimePrices(symbols);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Open Positions</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary font-mono animate-pulse">● LIVE</span>
          <span className="text-xs font-mono text-muted-foreground">{bets?.length || 0} active</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : !bets?.length ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No open positions. Place a bet to get started!
        </div>
      ) : (
        <div className="divide-y divide-border">
          {(bets as any[]).map((pos, i) => {
            const stake = Number(pos.stake);
            const entry = Number(pos.entry_price);
            const current = prices[pos.symbol] ?? entry;
            const isLong = pos.bet_type === 'long';

            // P&L: long profits when price goes up, short profits when price goes down
            const priceDiff = isLong ? current - entry : entry - current;
            const pnlPct = entry > 0 ? (priceDiff / entry) * 100 : 0;
            const pnlAmt = stake * (pnlPct / 100);
            const isWinning = pnlAmt >= 0;

            return (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${
                      isLong ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                    }`}>
                      {isLong ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {pos.bet_type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{pos.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-3.5 h-3.5 ${isWinning ? 'text-gain' : 'text-loss'}`} />
                    <span className={`text-sm font-mono font-bold ${isWinning ? 'text-gain' : 'text-loss'}`}>
                      {pnlAmt >= 0 ? '+' : ''}₹{pnlAmt.toFixed(2)}
                    </span>
                    <span className={`text-xs font-mono ${isWinning ? 'text-gain' : 'text-loss'}`}>
                      ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="font-mono">Stake: ₹{stake.toLocaleString('en-IN')}</span>
                    <span className="font-mono">Entry: ₹{entry.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-foreground">
                      Now: ₹{current.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {pos.expiry}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PositionsPanel;
