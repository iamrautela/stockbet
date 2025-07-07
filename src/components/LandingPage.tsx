import React from 'react';
import { TrendingUp, BarChart3, Wallet, Shield, Users, Zap, Star, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold">StockBet</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/20 to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Bet on Market Moves
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The future of stock market betting. Predict price movements, place smart bets, 
              and win big on NASDAQ, NSE, BSE, and global markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenAuth('register')}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center"
              >
                Start Trading <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg text-lg font-medium transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose StockBet?</h2>
            <p className="text-xl text-gray-400">Professional trading meets social betting</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <BarChart3 className="h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Data</h3>
              <p className="text-gray-400">Live market data from global exchanges including NASDAQ, NSE, BSE, and HKEX.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors">
              <Zap className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Instant Payouts</h3>
              <p className="text-gray-400">Lightning-fast bet settlement and instant withdrawals to your bank account.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
              <Shield className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Secure & Regulated</h3>
              <p className="text-gray-400">Bank-grade security with full KYC compliance and regulatory oversight.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-colors">
              <Wallet className="h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Easy Deposits</h3>
              <p className="text-gray-400">Multiple payment options including UPI, net banking, and digital wallets.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors">
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Social Trading</h3>
              <p className="text-gray-400">Follow top traders, share strategies, and compete on leaderboards.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors">
              <Star className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Smart Analytics</h3>
              <p className="text-gray-400">AI-powered insights and market analysis to improve your betting strategies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">$2.5M+</div>
              <div className="text-gray-400">Total Payouts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-400">Bets Placed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">98.5%</div>
              <div className="text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Winning?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of traders making smart bets on market movements
          </p>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 rounded-lg text-lg font-medium transition-all transform hover:scale-105"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold">StockBet</span>
              </div>
              <p className="text-gray-400">The future of stock market betting.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Markets</h3>
              <ul className="space-y-2 text-gray-400">
                <li>NASDAQ</li>
                <li>NSE</li>
                <li>BSE</li>
                <li>HKEX</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Legal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Security</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StockBet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;