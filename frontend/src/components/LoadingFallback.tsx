import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading StockBet...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we initialize the application</p>
      </div>
    </div>
  );
};

export default LoadingFallback; 