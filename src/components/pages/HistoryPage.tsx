import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Trophy, XCircle, Loader2, PartyPopper } from 'lucide-react';
import { useBetHistory } from '@/hooks/useBetting';
import { Fireworks } from '@/components/ui/Fireworks';

const HistoryPage = () => {
  const { data: trades, isLoading } = useBetHistory();
  const [fireworks, setFireworks] = useState(false);
  const [celebratedIds, setCelebratedIds] = useState<Set<string>>(new Set());

  // Trigger fireworks when a new winning bet appears
  useEffect(() => {
    if (!trades?.length) return;
    const newWins = (trades as any[]).filter(
      (t) => t.status === 'won' && !celebratedIds.has(t.id)
    );
    if (newWins.length > 0) {
      setFireworks(true);
      setCelebratedIds((prev) => {
        const next = new Set(prev);
        newWins.forEach((t) => next.add(t.id));
        return next;
      });
      setTimeout(() => setFireworks(false), 3500);
    }
  }, [trades]);

  const wonCount = (trades as any[] | undefined)?.filter((t) => t.status === 'won').length ?? 0;
  const lostCount = (trades as any[] | undefined)?.filter((t) => t.status === 'lost' || t.status === 'settled').length ?? 0;
  const totalPnl = (trades as any[] | undefined)?.reduce((sum, t) => sum + Number(t.pnl || 0), 0) ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <Fireworks active={fireworks} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Trade History</h2>
        {fireworks && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-sm font-bold text-gain bg-gain/10 px-3 py-1.5 rounded-full"
          >
            <PartyPopper className="w-4 h-4" /> You won!
          </motion.div>
        )}
      </div>

      {/* Summary stats */}
      {!!trades?.length && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Won', value: wonCount, color: 'text-gain' },
            { label: 'Lost', value: lostCount, color: 'text-loss' },
            { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-gain' : 'text-loss' },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

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
          <AnimatePresence>
            {(trades as any[]).map((trade, i) => {
              const won = trade.status === 'won';
              const pnl = Number(trade.pnl || 0);
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center ${
                    won ? 'bg-gain/5' : ''
                  }`}
                >
                  <div className="col-span-3 flex items-center gap-2">
                    {won ? (
                      <Trophy className="w-4 h-4 text-gain shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-loss shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${
                      trade.bet_type === 'long' ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                    }`}>
                      {trade.bet_type === 'long'
                        ? <ArrowUpRight className="w-2.5 h-2.5" />
                        : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {trade.bet_type.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{trade.symbol}</span>
                  </div>

                  <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                    ₹{Number(trade.entry_price).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-foreground">
                    ₹{Number(trade.exit_price || 0).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-foreground">
                    ₹{Number(trade.stake).toLocaleString('en-IN')}
                  </div>

                  <div className="col-span-3 text-right flex items-center justify-end gap-1.5">
                    {won && <span className="text-base">🎉</span>}
                    <span className={`font-mono text-sm font-bold ${won ? 'text-gain' : 'text-loss'}`}>
                      {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
