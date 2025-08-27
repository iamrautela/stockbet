import React from 'react';
import { TrendingUp, Wallet, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <span className="text-2xl font-bold">StockBet</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Balance */}
            <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">${user.balance.toLocaleString()}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <span className="font-medium">{user.name}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;