import { motion } from 'framer-motion';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { useWallet } from '@/hooks/useBetting';

const StatsBar = () => {
  const { data: wallet } = useWallet();

  const balance = wallet ? Number(wallet.balance) : 10000;
  const inBets = wallet ? Number(wallet.in_bets) : 0;
  const available = balance;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const stats = [
    { label: 'Portfolio Value', value: fmt(balance + inBets), icon: Activity, accent: 'primary' as const },
    { label: 'Available', value: fmt(available), icon: Target, accent: 'primary' as const },
    { label: 'In Bets', value: fmt(inBets), icon: TrendingUp, accent: 'gain' as const },
  ];

  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    gain: 'bg-gain/10 text-gain',
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentClasses[stat.accent]}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-mono text-xl font-bold text-foreground">{stat.value}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatsBar;
