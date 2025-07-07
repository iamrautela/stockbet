import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Transaction } from '../../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-5 w-5 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-blue-400" />;
      case 'bet':
        return <div className="h-5 w-5 bg-purple-500 rounded-full" />;
      case 'payout':
        return <div className="h-5 w-5 bg-emerald-500 rounded-full" />;
      default:
        return <div className="h-5 w-5 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'payout':
        return 'text-emerald-400';
      case 'withdrawal':
      case 'bet':
      case 'fee':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = ['deposit', 'payout'].includes(type) ? '+' : '-';
    return `${prefix}₹${amount.toLocaleString()}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="text-center py-8 text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div>
                <div className="font-medium capitalize">
                  {transaction.type.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-400">
                  {transaction.description}
                </div>
                <div className="text-xs text-gray-500">
                  {transaction.createdAt.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-medium ${getAmountColor(transaction.type)}`}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
              
              {transaction.fees > 0 && (
                <div className="text-xs text-gray-400">
                  Fee: ₹{transaction.fees}
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-1 mt-1">
                {getStatusIcon(transaction.status)}
                <span className="text-xs text-gray-400 capitalize">
                  {transaction.status}
                </span>
              </div>
              
              {transaction.reference && (
                <div className="text-xs text-gray-500 mt-1">
                  Ref: {transaction.reference}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;