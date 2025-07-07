import React, { useState } from 'react';
import { ArrowRightLeft, Calculator } from 'lucide-react';
import { CurrencyRate } from '../../types';
import { globalTradingService } from '../../services/globalTradingService';

interface CurrencyConverterProps {
  currencyRates: CurrencyRate[];
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currencyRates }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'HKD', 'SGD'];

  const handleConvert = async () => {
    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return;
      }

      const converted = await globalTradingService.convertCurrency(numAmount, fromCurrency, toCurrency);
      setConvertedAmount(converted);
    } catch (error) {
      console.error('Error converting currency:', error);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
  };

  const getExchangeRate = () => {
    const rate = currencyRates.find(r => r.from === fromCurrency && r.to === toCurrency);
    if (rate) return rate.rate;
    
    const reverseRate = currencyRates.find(r => r.from === toCurrency && r.to === fromCurrency);
    if (reverseRate) return 1 / reverseRate.rate;
    
    return null;
  };

  const exchangeRate = getExchangeRate();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold">Currency Converter</h3>
      </div>

      <div className="grid md:grid-cols-5 gap-4 items-end">
        {/* From Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setConvertedAmount(null);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter amount"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => {
              setFromCurrency(e.target.value);
              setConvertedAmount(null);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowRightLeft className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => {
              setToCurrency(e.target.value);
              setConvertedAmount(null);
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        {/* Convert Button */}
        <div>
          <button
            onClick={handleConvert}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
          >
            Convert
          </button>
        </div>
      </div>

      {/* Results */}
      {convertedAmount !== null && (
        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {convertedAmount.toLocaleString()} {toCurrency}
            </div>
            {exchangeRate && (
              <div className="text-sm text-gray-400 mt-1">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Conversions */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {[100, 500, 1000, 5000].map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => {
              setAmount(quickAmount.toString());
              setConvertedAmount(null);
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            {quickAmount}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencyConverter;