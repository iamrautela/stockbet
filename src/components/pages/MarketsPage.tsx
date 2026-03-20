import { motion } from 'framer-motion';
import { useMarketData } from '@/hooks/useMarketData';
import { Loader2 } from 'lucide-react';
import MiniChart from '@/components/dashboard/MiniChart';
import type { LiveStock } from '@/lib/market-api';
import { marketFlags } from '@/lib/mock-data';

interface MarketsPageProps {
  activeMarket: string;
}

const MarketsPage = ({ activeMarket }: MarketsPageProps) => {
  const { data: stocks, isLoading } = useMarketData(activeMarket);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {marketFlags[activeMarket]} Markets
        </h2>
        <span className="text-xs font-mono text-primary animate-pulse-glow">● LIVE</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
          <div className="col-span-3">Symbol</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Change</div>
          <div className="col-span-2 text-right hidden md:block">Volume</div>
          <div className="col-span-2 text-right hidden md:block">Mkt Cap</div>
          <div className="col-span-1 text-right">Chart</div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          (stocks || []).map((stock, i) => (
            <StockRow key={stock.symbol} stock={stock} index={i} />
          ))
        )}
      </div>
    </div>
  );
};

const StockRow = ({ stock, index }: { stock: LiveStock; index: number }) => {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer items-center"
    >
      <div className="col-span-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-[10px] font-bold font-mono text-foreground">
            {stock.symbol.slice(0, 3)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</p>
        </div>
      </div>
      <div className="col-span-2 text-right font-mono text-sm font-semibold text-foreground">
        ${stock.price.toLocaleString()}
      </div>
      <div className="col-span-2 text-right">
        <span className={`font-mono text-sm font-medium ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{stock.change.toFixed(2)}
        </span>
        <br />
        <span className={`font-mono text-xs ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
        </span>
      </div>
      <div className="col-span-2 text-right font-mono text-sm text-muted-foreground hidden md:block">
        {stock.volume}
      </div>
      <div className="col-span-2 text-right font-mono text-sm text-muted-foreground hidden md:block">
        {stock.marketCap}
      </div>
      <div className="col-span-1 flex justify-end">
        <MiniChart basePrice={stock.price} positive={isPositive} width={60} height={28} />
      </div>
    </motion.div>
  );
};

export default MarketsPage;
