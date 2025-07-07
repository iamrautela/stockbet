import React, { useState } from 'react';
import { X, Calculator, AlertTriangle } from 'lucide-react';
import { IPOData } from '../../types';

interface IPOBiddingModalProps {
  ipo: IPOData;
  userBalance: number;
  onClose: () => void;
  onSubmit: (quantity: number, pricePerShare: number) => void;
}

const IPOBiddingModal: React.FC<IPOBiddingModalProps> = ({ ipo, userBalance, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(ipo.lotSize);
  const [pricePerShare, setPricePerShare] = useState(ipo.priceRange.max);
  const [loading, setLoading] = useState(false);

  const totalAmount = quantity * pricePerShare;
  const isValidQuantity = quantity > 0 && quantity % ipo.lotSize === 0;
  const isValidPrice = pricePerShare >= ipo.priceRange.min && pricePerShare <= ipo.priceRange.max;
  const hasSufficientBalance = totalAmount <= userBalance;
  const canSubmit = isValidQuantity && isValidPrice && hasSufficientBalance;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await onSubmit(quantity, pricePerShare);
    } finally {
      setLoading(false);
    }
  };

  const getLotOptions = () => {
    const options = [];
    for (let i = 1; i <= 10; i++) {
      const lotQuantity = ipo.lotSize * i;
      const lotAmount = lotQuantity * ipo.priceRange.max;
      if (lotAmount <= userBalance) {
        options.push(i);
      }
    }
    return options;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Apply for IPO</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* IPO Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-2">{ipo.companyName}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Price Range</div>
              <div className="font-medium">₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}</div>
            </div>
            <div>
              <div className="text-gray-400">Lot Size</div>
              <div className="font-medium">{ipo.lotSize} shares</div>
            </div>
            <div>
              <div className="text-gray-400">Close Date</div>
              <div className="font-medium">{ipo.closeDate.toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Your Balance</div>
              <div className="font-medium">₹{userBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Bidding Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Lots
            </label>
            <div className="flex space-x-2 mb-2">
              {getLotOptions().slice(0, 5).map((lotCount) => (
                <button
                  key={lotCount}
                  onClick={() => setQuantity(ipo.lotSize * lotCount)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quantity === ipo.lotSize * lotCount
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {lotCount}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min={ipo.lotSize}
              step={ipo.lotSize}
            />
            {!isValidQuantity && quantity > 0 && (
              <div className="text-red-400 text-sm mt-1">
                Quantity must be in multiples of {ipo.lotSize}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per Share (₹)
            </label>
            <input
              type="number"
              value={pricePerShare}
              onChange={(e) => setPricePerShare(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min={ipo.priceRange.min}
              max={ipo.priceRange.max}
              step="0.01"
            />
            {!isValidPrice && (
              <div className="text-red-400 text-sm mt-1">
                Price must be between ₹{ipo.priceRange.min} and ₹{ipo.priceRange.max}
              </div>
            )}
          </div>

          {/* Calculation Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="h-5 w-5 text-emerald-400" />
              <span className="font-medium">Bid Summary</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Shares:</span>
                <span>{quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price per Share:</span>
                <span>₹{pricePerShare}</span>
              </div>
              <div className="flex justify-between font-medium text-lg border-t border-gray-600 pt-2">
                <span>Total Amount:</span>
                <span className={totalAmount > userBalance ? 'text-red-400' : 'text-emerald-400'}>
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!hasSufficientBalance && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Insufficient Balance</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                You need ₹{(totalAmount - userBalance).toLocaleString()} more to place this bid.
              </p>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="text-sm text-blue-400">
              <strong>Important:</strong>
              <ul className="mt-1 space-y-1 text-blue-300">
                <li>• Amount will be blocked until allotment</li>
                <li>• Allotment is not guaranteed</li>
                <li>• Refund for unallotted shares in 7 days</li>
                <li>• Cut-off price bids get priority</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Placing Bid...' : 'Place Bid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPOBiddingModal;