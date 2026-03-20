import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react';
import { useOpenBets } from '@/hooks/useBetting';

const PositionsPanel = () => {
  const { data: bets, isLoading } = useOpenBets();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Open Positions</h3>
        <span className="text-xs font-mono text-muted-foreground">{bets?.length || 0} active</span>
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
          {bets.map((pos, i) => {
            const stake = Number(pos.stake);
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
                      pos.bet_type === 'long' ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                    }`}>
                      {pos.bet_type === 'long' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {pos.bet_type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{pos.symbol}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {pos.expiry}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">Stake: ${stake}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">Entry: ${Number(pos.entry_price).toFixed(2)}</span>
                  </span>
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
