import { motion } from 'framer-motion';
import { Rocket, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockIPOs } from '@/lib/mock-data';

const sentimentConfig = {
  bullish: { icon: TrendingUp, className: 'text-gain bg-gain/10' },
  bearish: { icon: TrendingDown, className: 'text-loss bg-loss/10' },
  neutral: { icon: Minus, className: 'text-warning bg-warning/10' },
};

const statusConfig = {
  upcoming: 'bg-info/10 text-info',
  open: 'bg-gain/10 text-gain',
  listed: 'bg-muted text-muted-foreground',
};

const IPOPreview = () => {
  const ipos = mockIPOs.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">IPO Center</h3>
        </div>
        <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
      </div>
      <div className="divide-y divide-border">
        {ipos.map((ipo, i) => {
          const Sentiment = sentimentConfig[ipo.sentiment];
          const SentimentIcon = Sentiment.icon;
          return (
            <motion.div
              key={ipo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{ipo.company}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusConfig[ipo.status]}`}>
                    {ipo.status}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded flex items-center justify-center ${Sentiment.className}`}>
                  <SentimentIcon className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{ipo.exchange}</span>
                <span>•</span>
                <span>{ipo.sector}</span>
                <span>•</span>
                <span className="font-mono">{ipo.priceBand}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default IPOPreview;
