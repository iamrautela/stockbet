import React, { useState } from 'react';

interface CurrencyConverterProps {
  currencyRates: { from: string; to: string; rate: number }[];
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currencyRates }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'HKD', 'SGD'];

  const handleConvert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    const rateObj = currencyRates.find(r => r.from === fromCurrency && r.to === toCurrency);
    const rate = rateObj ? rateObj.rate : 1;
    setConvertedAmount(numAmount * rate);
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
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
      <h3 className="text-lg font-semibold mb-4">Currency Converter</h3>
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <button
          onClick={swapCurrencies}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mt-2 md:mt-0"
        >
          ⇄
        </button>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            min="0"
          />
        </div>
        <button
          onClick={handleConvert}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium text-white"
        >
          Convert
        </button>
      </div>
      {convertedAmount !== null && (
        <div className="mt-4 text-lg font-semibold text-emerald-400">
          {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
        </div>
      )}
      {exchangeRate && (
        <div className="mt-2 text-sm text-gray-400">
          1 {fromCurrency} = {exchangeRate} {toCurrency}
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;