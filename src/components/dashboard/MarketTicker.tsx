import { motion } from 'framer-motion';
import { useMarketData } from '@/hooks/useMarketData';
import { Loader2 } from 'lucide-react';
import type { LiveStock } from '@/lib/market-api';

interface MarketTickerProps {
  market: string;
  onSelectStock?: (stock: LiveStock) => void;
}

const MarketTicker = ({ market, onSelectStock }: MarketTickerProps) => {
  const { data: stocks, isLoading, error } = useMarketData(market);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Market Overview</h3>
        <span className="text-xs text-primary font-mono animate-pulse-glow">● LIVE</span>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Failed to load market data. Retrying...
        </div>
      ) : (
        <div className="divide-y divide-border">
          {(stocks || []).map((stock, i) => (
            <TickerRow key={stock.symbol} stock={stock} index={i} onClick={() => onSelectStock?.(stock)} />
          ))}
        </div>
      )}
    </div>
  );
};

const TickerRow = ({ stock, index, onClick }: { stock: LiveStock; index: number; onClick: () => void }) => {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-xs font-bold font-mono text-foreground">
            {stock.symbol.slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono font-semibold text-foreground">
          {stock.market === 'IN' ? '₹' : stock.market === 'HK' ? 'HK$' : '$'}{stock.price.toLocaleString('en-IN')}
        </p>
        <p className={`text-xs font-mono font-medium ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </motion.div>
  );
};

export default MarketTicker;
