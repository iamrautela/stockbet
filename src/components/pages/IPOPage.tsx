import { motion } from 'framer-motion';
import { Rocket, TrendingUp, TrendingDown, Minus, Calendar, Building2 } from 'lucide-react';
import { mockIPOs } from '@/lib/mock-data';

const sentimentConfig = {
  bullish: { icon: TrendingUp, className: 'text-gain bg-gain/10', label: 'Bullish' },
  bearish: { icon: TrendingDown, className: 'text-loss bg-loss/10', label: 'Bearish' },
  neutral: { icon: Minus, className: 'text-warning bg-warning/10', label: 'Neutral' },
};

const statusBadge = {
  upcoming: 'bg-info/10 text-info border-info/20',
  open: 'bg-gain/10 text-gain border-gain/20',
  listed: 'bg-muted text-muted-foreground border-border',
};

const IPOPage = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">IPO Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockIPOs.map((ipo, i) => {
          const sent = sentimentConfig[ipo.sentiment];
          const SentIcon = sent.icon;
          return (
            <motion.div
              key={ipo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-card border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer ${statusBadge[ipo.status].includes('border') ? '' : 'border-border'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">{ipo.company}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{ipo.symbol}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-semibold border ${statusBadge[ipo.status]}`}>
                  {ipo.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{ipo.exchange} • {ipo.sector}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{ipo.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-foreground font-semibold">{ipo.priceBand}</span>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${sent.className}`}>
                    <SentIcon className="w-3 h-3" />
                    {sent.label}
                  </div>
                </div>
              </div>

              {ipo.status !== 'listed' && (
                <button className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                  Place Prediction Bet
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default IPOPage;
