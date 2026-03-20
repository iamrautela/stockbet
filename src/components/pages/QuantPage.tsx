import { motion } from 'framer-motion';
import { FlaskConical, Play, BarChart3, TrendingUp, Shield, Target } from 'lucide-react';

const mockStrategies = [
  { id: '1', name: 'Momentum Breakout', winRate: 72.4, sharpe: 1.85, drawdown: -8.2, trades: 134, returns: 24.5 },
  { id: '2', name: 'Mean Reversion', winRate: 58.1, sharpe: 1.22, drawdown: -12.5, trades: 89, returns: 15.8 },
  { id: '3', name: 'Volatility Squeeze', winRate: 65.9, sharpe: 1.56, drawdown: -6.1, trades: 67, returns: 19.3 },
];

const QuantPage = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Quant Lab</h2>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
          <Play className="w-3.5 h-3.5" /> New Strategy
        </button>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mockStrategies.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all"
          >
            <h3 className="text-base font-bold text-foreground mb-3">{s.name}</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Win Rate', value: `${s.winRate}%`, icon: Target, color: 'text-gain' },
                { label: 'Sharpe', value: s.sharpe.toFixed(2), icon: BarChart3, color: 'text-primary' },
                { label: 'Max DD', value: `${s.drawdown}%`, icon: Shield, color: 'text-loss' },
                { label: 'Returns', value: `+${s.returns}%`, icon: TrendingUp, color: 'text-gain' },
              ].map((metric) => (
                <div key={metric.label} className="bg-muted rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <metric.icon className={`w-3 h-3 ${metric.color}`} />
                    <span className="text-[10px] text-muted-foreground">{metric.label}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{s.trades} trades backtested</span>
              <button className="text-primary hover:underline font-medium">Run Backtest</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder Chart Area */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Backtest Results</h3>
        <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select a strategy to view backtest results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantPage;
