import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calculator, Brain, Target, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Strategy {
  id: string;
  name: string;
  description: string;
  parameters: { [key: string]: number };
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
  };
}

interface BacktestResult {
  equity: number[];
  trades: Array<{
    date: Date;
    type: 'buy' | 'sell';
    price: number;
    quantity: number;
    pnl: number;
  }>;
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
  };
}

const QuantAnalysis: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('momentum');
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [parameters, setParameters] = useState({
    lookbackPeriod: 20,
    threshold: 0.02,
    stopLoss: 0.05,
    takeProfit: 0.10,
    riskPerTrade: 0.02
  });

  const strategies: Strategy[] = [
    {
      id: 'momentum',
      name: 'Momentum Strategy',
      description: 'Buy stocks showing strong upward momentum and sell when momentum weakens',
      parameters: { lookbackPeriod: 20, threshold: 0.02 },
      performance: {
        totalReturn: 15.4,
        sharpeRatio: 1.2,
        maxDrawdown: -8.5,
        winRate: 62,
        totalTrades: 145
      }
    },
    {
      id: 'meanReversion',
      name: 'Mean Reversion',
      description: 'Buy oversold stocks and sell overbought stocks based on statistical analysis',
      parameters: { lookbackPeriod: 14, threshold: 2.0 },
      performance: {
        totalReturn: 12.8,
        sharpeRatio: 0.9,
        maxDrawdown: -12.3,
        winRate: 58,
        totalTrades: 203
      }
    },
    {
      id: 'pairs',
      name: 'Pairs Trading',
      description: 'Trade correlated stocks when their price relationship deviates from the norm',
      parameters: { lookbackPeriod: 30, threshold: 1.5 },
      performance: {
        totalReturn: 9.2,
        sharpeRatio: 1.5,
        maxDrawdown: -5.8,
        winRate: 65,
        totalTrades: 89
      }
    },
    {
      id: 'ml',
      name: 'ML Prediction',
      description: 'Use machine learning to predict price movements based on technical indicators',
      parameters: { lookbackPeriod: 50, threshold: 0.6 },
      performance: {
        totalReturn: 22.1,
        sharpeRatio: 1.8,
        maxDrawdown: -15.2,
        winRate: 71,
        totalTrades: 167
      }
    }
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simulate backtest execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock backtest results
    const mockResults: BacktestResult = {
      equity: generateEquityCurve(),
      trades: generateTrades(),
      metrics: {
        totalReturn: 18.5 + (Math.random() - 0.5) * 10,
        annualizedReturn: 15.2 + (Math.random() - 0.5) * 8,
        volatility: 12.8 + (Math.random() - 0.5) * 4,
        sharpeRatio: 1.4 + (Math.random() - 0.5) * 0.8,
        maxDrawdown: -8.2 - Math.random() * 5,
        winRate: 65 + (Math.random() - 0.5) * 20,
        profitFactor: 1.8 + (Math.random() - 0.5) * 0.6
      }
    };
    
    setBacktestResults(mockResults);
    setIsRunning(false);
  };

  const generateEquityCurve = () => {
    const points = 252; // Trading days in a year
    const equity = [10000];
    
    for (let i = 1; i < points; i++) {
      const dailyReturn = (Math.random() - 0.45) * 0.02; // Slight positive bias
      equity.push(equity[i - 1] * (1 + dailyReturn));
    }
    
    return equity;
  };

  const generateTrades = () => {
    const trades = [];
    const numTrades = 50 + Math.floor(Math.random() * 100);
    
    for (let i = 0; i < numTrades; i++) {
      const date = new Date(2024, 0, 1 + i * 5);
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const price = 100 + Math.random() * 50;
      const quantity = Math.floor(Math.random() * 100) + 10;
      const pnl = (Math.random() - 0.4) * 1000; // Slight positive bias
      
      trades.push({ date, type, price, quantity, pnl });
    }
    
    return trades;
  };

  const chartData = backtestResults ? {
    labels: backtestResults.equity.map((_, i) => new Date(2024, 0, 1 + i)),
    datasets: [
      {
        label: 'Portfolio Value',
        data: backtestResults.equity,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Backtest Equity Curve'
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold">Quantitative Analysis</h1>
        </div>
        <p className="text-gray-300">
          Backtest trading strategies, analyze performance metrics, and optimize parameters using advanced quantitative methods.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Strategy Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Trading Strategies</h2>
            <div className="space-y-3">
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedStrategy === strategy.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium mb-1">{strategy.name}</div>
                  <div className="text-sm text-gray-400 mb-2">{strategy.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Return:</span>
                      <span className={`ml-1 ${strategy.performance.totalReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {strategy.performance.totalReturn > 0 ? '+' : ''}{strategy.performance.totalReturn}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Win Rate:</span>
                      <span className="ml-1 text-blue-400">{strategy.performance.winRate}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Strategy Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lookback Period
                </label>
                <input
                  type="number"
                  value={parameters.lookbackPeriod}
                  onChange={(e) => setParameters(prev => ({ ...prev, lookbackPeriod: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="5"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Signal Threshold
                </label>
                <input
                  type="number"
                  value={parameters.threshold}
                  onChange={(e) => setParameters(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.01"
                  min="0.01"
                  max="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  value={parameters.stopLoss * 100}
                  onChange={(e) => setParameters(prev => ({ ...prev, stopLoss: Number(e.target.value) / 100 }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.5"
                  min="1"
                  max="20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  value={parameters.takeProfit * 100}
                  onChange={(e) => setParameters(prev => ({ ...prev, takeProfit: Number(e.target.value) / 100 }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.5"
                  min="2"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Run Backtest */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 font-medium rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Running Backtest...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Run Backtest</span>
                </>
              )}
            </button>
            
            {backtestResults && (
              <button
                onClick={() => setBacktestResults(null)}
                className="w-full mt-2 py-2 bg-gray-700 hover:bg-gray-600 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {backtestResults ? (
            <>
              {/* Performance Metrics */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Total Return</div>
                    <div className={`text-xl font-bold ${backtestResults.metrics.totalReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {backtestResults.metrics.totalReturn > 0 ? '+' : ''}{backtestResults.metrics.totalReturn.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Sharpe Ratio</div>
                    <div className="text-xl font-bold text-blue-400">
                      {backtestResults.metrics.sharpeRatio.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Max Drawdown</div>
                    <div className="text-xl font-bold text-red-400">
                      {backtestResults.metrics.maxDrawdown.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Win Rate</div>
                    <div className="text-xl font-bold text-purple-400">
                      {backtestResults.metrics.winRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Equity Curve */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
                {chartData && (
                  <div className="h-80">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                )}
              </div>

              {/* Trade History */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-300">Date</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-300">Type</th>
                        <th className="text-right py-2 px-4 font-medium text-gray-300">Price</th>
                        <th className="text-right py-2 px-4 font-medium text-gray-300">Quantity</th>
                        <th className="text-right py-2 px-4 font-medium text-gray-300">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.trades.slice(0, 10).map((trade, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="py-2 px-4 text-gray-300">
                            {trade.date.toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right text-gray-300">
                            ${trade.price.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right text-gray-300">
                            {trade.quantity}
                          </td>
                          <td className={`py-2 px-4 text-right font-medium ${
                            trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Backtest</h3>
              <p className="text-gray-400 mb-6">
                Select a strategy, adjust parameters, and run a backtest to see how your strategy would have performed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <Target className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="font-medium">Historical Data</div>
                  <div className="text-gray-400">1+ years of market data</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="font-medium">Fast Execution</div>
                  <div className="text-gray-400">Results in seconds</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="font-medium">Detailed Analytics</div>
                  <div className="text-gray-400">Comprehensive metrics</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantAnalysis;