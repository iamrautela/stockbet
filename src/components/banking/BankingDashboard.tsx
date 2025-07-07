import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { User, BankAccount, Transaction } from '../../types';
import { bankingService } from '../../services/bankingService';
import AddBankAccountModal from './AddBankAccountModal';
import TransactionHistory from './TransactionHistory';
import KYCVerification from './KYCVerification';
import toast from 'react-hot-toast';

interface BankingDashboardProps {
  user: User;
}

const BankingDashboard: React.FC<BankingDashboardProps> = ({ user }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    loadBankingData();
  }, [user.id]);

  const loadBankingData = async () => {
    setLoading(true);
    try {
      // Load bank accounts
      const accounts = user.bankAccounts || [];
      setBankAccounts(accounts);
      
      if (accounts.length > 0) {
        setSelectedBankAccount(accounts.find(acc => acc.isPrimary)?.id || accounts[0].id);
      }

      // Load transaction history
      const transactionHistory = await bankingService.getTransactionHistory(user.id);
      setTransactions(transactionHistory);

      // Check KYC status
      const kycData = await bankingService.checkKYCStatus(user.id);
      setKycStatus(kycData.status);
    } catch (error) {
      console.error('Error loading banking data:', error);
      toast.error('Failed to load banking information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async (accountData: Omit<BankAccount, 'id' | 'isVerified' | 'addedAt'>) => {
    const result = await bankingService.linkBankAccount(accountData);
    
    if (result.success) {
      toast.success('Bank account added successfully! Verification in progress.');
      setShowAddBankModal(false);
      loadBankingData();
    } else {
      toast.error(result.error || 'Failed to add bank account');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !selectedBankAccount) {
      toast.error('Please enter amount and select bank account');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 100) {
      toast.error('Minimum deposit amount is ₹100');
      return;
    }

    const result = await bankingService.initiateDeposit(amount, selectedBankAccount);
    
    if (result.success) {
      toast.success('Deposit initiated successfully!');
      setDepositAmount('');
      loadBankingData();
    } else {
      toast.error(result.error || 'Failed to initiate deposit');
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawAmount || !selectedBankAccount) {
      toast.error('Please enter amount and select bank account');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }

    if (amount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    const result = await bankingService.initiateWithdrawal(amount, selectedBankAccount);
    
    if (result.success) {
      toast.success('Withdrawal initiated successfully!');
      setWithdrawAmount('');
      loadBankingData();
    } else {
      toast.error(result.error || 'Failed to initiate withdrawal');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'rejected':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-yellow-400 bg-yellow-500/10';
    }
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
          <h2 className="text-2xl font-bold">Banking & Payments</h2>
          <p className="text-gray-400">Manage your bank accounts and transactions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* KYC Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getKYCStatusColor(kycStatus)}`}>
            KYC: {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
          </div>
          
          {kycStatus !== 'verified' && (
            <button
              onClick={() => setShowKYCModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Complete KYC
            </button>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Available Balance</div>
            <div className="text-3xl font-bold">₹{user.balance.toLocaleString()}</div>
          </div>
          <CreditCard className="h-12 w-12 opacity-80" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold">Deposit Money</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter amount"
                min="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Account</label>
              <select
                value={selectedBankAccount}
                onChange={(e) => setSelectedBankAccount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.filter(acc => acc.isVerified).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - ****{account.accountNumber.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleDeposit}
              disabled={!depositAmount || !selectedBankAccount || kycStatus !== 'verified'}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              Deposit Money
            </button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ArrowUpRight className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Withdraw Money</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                min="500"
                max={user.balance}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Account</label>
              <select
                value={selectedBankAccount}
                onChange={(e) => setSelectedBankAccount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bank Account</option>
                {bankAccounts.filter(acc => acc.isVerified).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bankName} - ****{account.accountNumber.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleWithdrawal}
              disabled={!withdrawAmount || !selectedBankAccount || kycStatus !== 'verified'}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              Withdraw Money
            </button>
          </div>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Linked Bank Accounts</h3>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Account</span>
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bank accounts linked</p>
            <p className="text-sm">Add a bank account to start depositing and withdrawing funds</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border transition-colors ${
                  account.isPrimary ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{account.bankName}</div>
                    <div className="text-sm text-gray-400">
                      ****{account.accountNumber.slice(-4)} • {account.accountHolderName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {account.isPrimary && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                        Primary
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      account.isVerified 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {account.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <TransactionHistory transactions={transactions.slice(0, 10)} />

      {/* Modals */}
      {showAddBankModal && (
        <AddBankAccountModal
          onClose={() => setShowAddBankModal(false)}
          onSubmit={handleAddBankAccount}
        />
      )}

      {showKYCModal && (
        <KYCVerification
          userId={user.id}
          onClose={() => setShowKYCModal(false)}
          onComplete={() => {
            setShowKYCModal(false);
            setKycStatus('pending');
            toast.success('KYC documents submitted for verification');
          }}
        />
      )}
    </div>
  );
};

export default BankingDashboard;