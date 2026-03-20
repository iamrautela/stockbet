import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Trophy, XCircle, Loader2 } from 'lucide-react';
import { useBetHistory } from '@/hooks/useBetting';

const HistoryPage = () => {
  const { data: trades, isLoading } = useBetHistory();

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-foreground">Trade History</h2>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
          <div className="col-span-3">Trade</div>
          <div className="col-span-2 text-right">Entry</div>
          <div className="col-span-2 text-right">Exit</div>
          <div className="col-span-2 text-right">Stake</div>
          <div className="col-span-3 text-right">Result</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : !trades?.length ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            No trade history yet. Settled bets will appear here.
          </div>
        ) : (
          trades.map((trade, i) => {
            const won = trade.status === 'won';
            const pnl = Number(trade.pnl || 0);
            return (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center"
              >
                <div className="col-span-3 flex items-center gap-2">
                  {won ? <Trophy className="w-4 h-4 text-gain" /> : <XCircle className="w-4 h-4 text-loss" />}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    trade.bet_type === 'long' ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                  }`}>
                    {trade.bet_type === 'long' ? <ArrowUpRight className="w-2.5 h-2.5 inline" /> : <ArrowDownRight className="w-2.5 h-2.5 inline" />}
                    {' '}{trade.bet_type.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{trade.symbol}</span>
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                  ${Number(trade.entry_price).toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-foreground">
                  ${Number(trade.exit_price || 0).toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-foreground">
                  ${Number(trade.stake)}
                </div>
                <div className="col-span-3 text-right">
                  <span className={`font-mono text-sm font-bold ${won ? 'text-gain' : 'text-loss'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
