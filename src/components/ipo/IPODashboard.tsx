import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Users, AlertCircle, Clock } from 'lucide-react';
import { IPOData, User } from '../../types';
import { ipoService } from '../../services/ipoService';
import IPOBiddingModal from './IPOBiddingModal';
import toast from 'react-hot-toast';

interface IPODashboardProps {
  user: User;
}

const IPODashboard: React.FC<IPODashboardProps> = ({ user }) => {
  const [ipos, setIpos] = useState<IPOData[]>([]);
  const [selectedIPO, setSelectedIPO] = useState<IPOData | null>(null);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'open' | 'closed'>('all');

  useEffect(() => {
    loadIPOs();
  }, []);

  const loadIPOs = async () => {
    setLoading(true);
    try {
      const ipoData = await ipoService.getUpcomingIPOs();
      setIpos(ipoData);
    } catch (error) {
      console.error('Error loading IPOs:', error);
      toast.error('Failed to load IPO data');
    } finally {
      setLoading(false);
    }
  };

  const handleBidOnIPO = (ipo: IPOData) => {
    if (user.kycStatus !== 'verified') {
      toast.error('Please complete KYC verification to bid on IPOs');
      return;
    }

    setSelectedIPO(ipo);
    setShowBiddingModal(true);
  };

  const handleBidSubmit = async (quantity: number, pricePerShare: number) => {
    if (!selectedIPO) return;

    const result = await ipoService.placeBidOnIPO(selectedIPO.id, quantity, pricePerShare);
    
    if (result.success) {
      toast.success('IPO bid placed successfully!');
      setShowBiddingModal(false);
      setSelectedIPO(null);
    } else {
      toast.error(result.error || 'Failed to place IPO bid');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-400 bg-blue-500/10';
      case 'open':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'closed':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'listed':
        return 'text-purple-400 bg-purple-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getGMPColor = (gmp: number) => {
    if (gmp > 0) return 'text-emerald-400';
    if (gmp < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const filteredIPOs = ipos.filter(ipo => {
    if (filter === 'all') return true;
    return ipo.status === filter;
  });

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IPO Center</h2>
          <p className="text-gray-400">Invest in upcoming Initial Public Offerings</p>
        </div>
        
        <div className="flex space-x-2">
          {(['all', 'upcoming', 'open', 'closed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* IPO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Total IPOs</h3>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold">{ipos.length}</div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Open for Bidding</h3>
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {ipos.filter(ipo => ipo.status === 'open').length}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Upcoming</h3>
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {ipos.filter(ipo => ipo.status === 'upcoming').length}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300">Avg. Subscription</h3>
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {(ipos.reduce((sum, ipo) => sum + ipo.subscriptionRate, 0) / ipos.length || 0).toFixed(1)}x
          </div>
        </div>
      </div>

      {/* IPO List */}
      <div className="space-y-6">
        {filteredIPOs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No IPOs Found</h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'No IPOs available at the moment'
                : `No ${filter} IPOs available`
              }
            </p>
          </div>
        ) : (
          filteredIPOs.map((ipo) => (
            <div key={ipo.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Company Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{ipo.companyName}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-gray-400">{ipo.symbol}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{ipo.sector}</span>
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ipo.status)}`}>
                        {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                      </div>
                    </div>
                  </div>

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
                      <div className="text-gray-400">Min Investment</div>
                      <div className="font-medium">₹{(ipo.priceRange.max * ipo.lotSize).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Subscription</div>
                      <div className="font-medium">{ipo.subscriptionRate.toFixed(1)}x</div>
                    </div>
                  </div>
                </div>

                {/* Dates & GMP */}
                <div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-gray-400">Open Date</div>
                      <div className="font-medium">{ipo.openDate.toLocaleDateString()}</div>
                      {ipo.status === 'upcoming' && (
                        <div className="text-xs text-blue-400">
                          {getDaysUntil(ipo.openDate)} days to go
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-400">Close Date</div>
                      <div className="font-medium">{ipo.closeDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Listing Date</div>
                      <div className="font-medium">{ipo.listingDate.toLocaleDateString()}</div>
                    </div>
                    {ipo.gmpPrice && (
                      <div>
                        <div className="text-gray-400">GMP</div>
                        <div className={`font-medium ${getGMPColor(ipo.gmpPrice)}`}>
                          {ipo.gmpPrice > 0 ? '+' : ''}₹{ipo.gmpPrice}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financials & Action */}
                <div>
                  <div className="space-y-3 text-sm mb-4">
                    <div>
                      <div className="text-gray-400">Revenue</div>
                      <div className="font-medium">₹{ipo.financials.revenue} Cr</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Profit</div>
                      <div className="font-medium">₹{ipo.financials.profit} Cr</div>
                    </div>
                    <div>
                      <div className="text-gray-400">P/E Ratio</div>
                      <div className="font-medium">{ipo.financials.peRatio}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">ROE</div>
                      <div className="font-medium">{ipo.financials.roe}%</div>
                    </div>
                  </div>

                  {ipo.status === 'open' && (
                    <button
                      onClick={() => handleBidOnIPO(ipo)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  )}

                  {ipo.status === 'upcoming' && (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Opens {ipo.openDate.toLocaleDateString()}
                    </button>
                  )}

                  {ipo.status === 'closed' && (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-600 rounded-lg font-medium cursor-not-allowed"
                    >
                      Bidding Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* KYC Warning */}
      {user.kycStatus !== 'verified' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">KYC Verification Required</span>
          </div>
          <p className="text-sm text-yellow-300 mt-1">
            Complete your KYC verification to participate in IPO bidding.
          </p>
        </div>
      )}

      {/* IPO Bidding Modal */}
      {showBiddingModal && selectedIPO && (
        <IPOBiddingModal
          ipo={selectedIPO}
          userBalance={user.balance}
          onClose={() => {
            setShowBiddingModal(false);
            setSelectedIPO(null);
          }}
          onSubmit={handleBidSubmit}
        />
      )}
    </div>
  );
};

export default IPODashboard;