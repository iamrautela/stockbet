import { motion } from 'framer-motion';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { useWallet } from '@/hooks/useBetting';

const StatsBar = () => {
  const { data: wallet, isLoading } = useWallet();

  const balance = wallet != null ? Number(wallet.balance) : null;
  const inBets = wallet != null ? Number(wallet.in_bets) : null;
  const available = balance ?? 0;
  const inBetsVal = inBets ?? 0;

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const portfolio = balance != null ? balance + inBetsVal : null;

  const stats = [
    {
      label: 'Portfolio Value',
      value: isLoading ? '…' : balance != null ? fmt(portfolio!) : fmt(0),
      icon: Activity,
      accent: 'primary' as const,
    },
    {
      label: 'Available',
      value: isLoading ? '…' : balance != null ? fmt(available) : fmt(0),
      icon: Target,
      accent: 'primary' as const,
    },
    {
      label: 'In Bets',
      value: isLoading ? '…' : balance != null ? fmt(inBetsVal) : fmt(0),
      icon: TrendingUp,
      accent: 'gain' as const,
    },
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
