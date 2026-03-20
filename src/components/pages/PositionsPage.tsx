import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react';
import { useOpenBets, useWallet } from '@/hooks/useBetting';

const PositionsPage = () => {
  const { data: bets, isLoading } = useOpenBets();
  const { data: wallet } = useWallet();

  const inBets = wallet ? Number(wallet.in_bets) : 0;
  const available = wallet ? Number(wallet.balance) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-foreground">Positions</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'In Bets', value: `$${inBets.toLocaleString()}` },
          { label: 'Open', value: (bets?.length || 0).toString() },
          { label: 'Available', value: `$${available.toLocaleString()}` },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <p className="font-mono text-lg font-bold text-foreground mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
          <div className="col-span-3">Position</div>
          <div className="col-span-2 text-right">Entry</div>
          <div className="col-span-2 text-right">Stake</div>
          <div className="col-span-2 text-right">Expiry</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : !bets?.length ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No open positions yet. Place a bet to get started!
          </div>
        ) : (
          bets.map((pos, i) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center"
            >
              <div className="col-span-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  pos.bet_type === 'long' ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                }`}>
                  {pos.bet_type === 'long' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {pos.bet_type.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-foreground">{pos.symbol}</span>
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                ${Number(pos.entry_price).toFixed(2)}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-foreground">
                ${Number(pos.stake)}
              </div>
              <div className="col-span-2 text-right text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" /> {pos.expiry}
              </div>
              <div className="col-span-3 text-right">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                  {pos.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PositionsPage;
