import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register' | 'phone' | 'forgot') => void;
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
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-center">
          Bet on Stocks. Win Big. <span className="text-emerald-400">Trade Smarter.</span>
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-2xl">
          StockBet is a next-gen platform where you can bet on stock price movements, compete with others, and grow your virtual portfolio. No real money required. Just skill, strategy, and fun!
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => onOpenAuth('register')}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Get Started
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="px-8 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Demo Login
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 