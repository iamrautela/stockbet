import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, CircleDollarSign, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';

const typeConfig: Record<string, { icon: any; label: string; className: string }> = {
  deposit: { icon: ArrowDownToLine, label: 'Deposit', className: 'text-green-500 bg-green-500/10' },
  withdrawal: { icon: ArrowUpFromLine, label: 'Withdrawal', className: 'text-red-500 bg-red-500/10' },
  bet: { icon: CircleDollarSign, label: 'Bet', className: 'text-yellow-500 bg-yellow-500/10' },
  payout: { icon: Wallet, label: 'Payout', className: 'text-primary bg-primary/10' },
};

const statusBadge: Record<string, string> = {
  completed: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  failed: 'bg-red-500/10 text-red-500',
};

const WalletPage = () => {
  const { wallet, transactions, isLoading: walletLoading, refetch } = useWallet();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const txLoading = walletLoading;

  const balance = wallet ? Number(wallet.balance) : 0;
  const inBets = wallet ? Number(wallet.in_bets) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Wallet</h2>
        <div className="flex gap-2">
          <Button onClick={() => setDepositOpen(true)} size="sm">
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button onClick={() => setWithdrawOpen(true)} variant="outline" size="sm">
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Balance', value: balance + inBets, icon: Wallet },
          { label: 'Available', value: balance, icon: CircleDollarSign },
          { label: 'In Bets', value: inBets, icon: CircleDollarSign },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-mono text-xl font-bold text-foreground">
              {walletLoading ? '...' : `$${s.value.toLocaleString()}`}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
        </div>
        {txLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : !transactions?.length ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No transactions yet. Place a bet to see activity here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx, i) => {
              const config = typeConfig[tx.type] || typeConfig.bet;
              const TxIcon = config.icon;
              const amount = Number(tx.amount);
              const isNeg = amount < 0;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.className}`}>
                      <TxIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description || config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-semibold ${isNeg ? 'text-loss' : 'text-gain'}`}>
                      {isNeg ? `-$${Math.abs(amount)}` : `+$${amount}`}
                    </p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadge[tx.status] || ''}`}>
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onSuccess={refetch}
      />

      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        currentBalance={balance}
        onSuccess={refetch}
      />
    </div>
  );
};

export default WalletPage;
