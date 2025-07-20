import React, { useState } from 'react';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { User, BankAccount, Transaction } from '../../types';
import AddBankAccountModal from './AddBankAccountModal';
import TransactionHistory from './TransactionHistory';
import KYCVerification from './KYCVerification';
import toast from 'react-hot-toast';

interface BankingDashboardProps {
  user: User;
}

// Mock data
const mockBankAccounts: BankAccount[] = [
  {
    id: 'bank1',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX1234',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'Demo User',
    isPrimary: true,
    isVerified: true,
    addedAt: new Date().toISOString(),
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'txn1',
    type: 'deposit',
    amount: 50000,
    status: 'completed',
    date: new Date().toISOString(),
    bankAccountId: 'bank1',
  },
  {
    id: 'txn2',
    type: 'withdrawal',
    amount: 10000,
    status: 'pending',
    date: new Date(Date.now() - 86400000).toISOString(),
    bankAccountId: 'bank1',
  },
];

const BankingDashboard: React.FC<BankingDashboardProps> = ({ user }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<'pending' | 'verified' | 'rejected'>('verified');

  const handleAddBankAccount = (account: Omit<BankAccount, 'id' | 'isVerified' | 'addedAt'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: `bank${bankAccounts.length + 1}`,
      isVerified: false,
      addedAt: new Date().toISOString(),
    };
    setBankAccounts((prev) => [...prev, newAccount]);
    setShowAddBankModal(false);
    toast.success('Bank account added!');
  };

  const handleKYCComplete = () => {
    setKycStatus('pending');
    setShowKYCModal(false);
    toast.success('KYC documents submitted for verification');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Banking Dashboard</h2>
        <button
          onClick={() => setShowAddBankModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Bank Account</span>
        </button>
      </div>
      {/* Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">{account.bankName}</div>
              {account.isPrimary && (
                <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">Primary</span>
              )}
            </div>
            <div className="text-gray-400 text-sm mb-2">A/C: {account.accountNumber}</div>
            <div className="text-gray-400 text-sm mb-2">IFSC: {account.ifscCode}</div>
            <div className="text-gray-400 text-sm mb-2">Holder: {account.accountHolderName}</div>
            <div className="text-xs mt-2">
              {account.isVerified ? (
                <span className="text-emerald-400 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Verified</span>
              ) : (
                <span className="text-yellow-400 flex items-center"><Clock className="h-4 w-4 mr-1" /> Pending Verification</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Transactions */}
      <TransactionHistory transactions={transactions} bankAccounts={bankAccounts} />
      {/* KYC */}
      <div className="mt-8">
        <div className="flex items-center space-x-4">
          <span className="font-semibold">KYC Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${kycStatus === 'verified' ? 'bg-emerald-600 text-white' : kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}</span>
          <button
            onClick={() => setShowKYCModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
          >
            {kycStatus === 'verified' ? 'Update KYC' : 'Submit KYC'}
          </button>
        </div>
      </div>
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
          onComplete={handleKYCComplete}
        />
      )}
    </div>
  );
};

export default BankingDashboard;