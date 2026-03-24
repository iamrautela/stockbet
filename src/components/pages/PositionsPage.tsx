import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Loader2 } from 'lucide-react';
import { useOpenBets, useWallet } from '@/hooks/useBetting';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';

const PositionsPage = () => {
  const { data: bets, isLoading } = useOpenBets();
  const { data: wallet } = useWallet();

  const symbols = [...new Set((bets || []).map((b: any) => b.symbol as string))];
  const { data: prices = {} } = useRealtimePrices(symbols);

  const inBets = wallet ? Number(wallet.in_bets) : 0;
  const available = wallet ? Number(wallet.balance) : 0;

  // Live unrealised P&L across all open bets
  const livePnl = (bets as any[] | undefined)?.reduce((sum, pos) => {
    const entry = Number(pos.entry_price);
    const current = prices[pos.symbol] ?? entry;
    const isLong = pos.bet_type === 'long';
    const priceDiff = isLong ? current - entry : entry - current;
    const pnlPct = entry > 0 ? priceDiff / entry : 0;
    return sum + Number(pos.stake) * pnlPct;
  }, 0) ?? 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Positions</h2>
        <span className="text-xs text-primary font-mono animate-pulse">● LIVE</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'In Bets', value: `₹${inBets.toLocaleString('en-IN')}` },
          { label: 'Open', value: (bets?.length || 0).toString() },
          { label: 'Available', value: `₹${available.toLocaleString('en-IN')}` },
          {
            label: 'Unrealised P&L',
            value: `${livePnl >= 0 ? '+' : ''}₹${livePnl.toFixed(2)}`,
            color: livePnl >= 0 ? 'text-gain' : 'text-loss',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <p className={`font-mono text-lg font-bold mt-1 ${(s as any).color ?? 'text-foreground'}`}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
          <div className="col-span-3">Position</div>
          <div className="col-span-2 text-right">Entry</div>
          <div className="col-span-2 text-right">Current</div>
          <div className="col-span-2 text-right">Stake</div>
          <div className="col-span-3 text-right">Live P&L</div>
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
          (bets as any[]).map((pos, i) => {
            const entry = Number(pos.entry_price);
            const current = prices[pos.symbol] ?? entry;
            const isLong = pos.bet_type === 'long';
            const priceDiff = isLong ? current - entry : entry - current;
            const pnlPct = entry > 0 ? (priceDiff / entry) * 100 : 0;
            const pnlAmt = Number(pos.stake) * (pnlPct / 100);
            const winning = pnlAmt >= 0;

            return (
              <motion.div
                key={pos.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors items-center"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isLong ? 'bg-gain/10 text-gain' : 'bg-loss/10 text-loss'
                  }`}>
                    {isLong ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {pos.bet_type.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{pos.symbol}</span>
                </div>

                <div className="col-span-2 text-right font-mono text-sm text-muted-foreground">
                  ₹{entry.toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-foreground">
                  ₹{current.toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-foreground">
                  ₹{Number(pos.stake).toLocaleString('en-IN')}
                </div>
                <div className="col-span-3 text-right">
                  <span className={`font-mono text-sm font-bold ${winning ? 'text-gain' : 'text-loss'}`}>
                    {pnlAmt >= 0 ? '+' : ''}₹{pnlAmt.toFixed(2)}
                  </span>
                  <span className={`text-xs font-mono ml-1 ${winning ? 'text-gain' : 'text-loss'}`}>
                    ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
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

export default PositionsPage;
