import React from 'react';
import Dashboard from './components/Dashboard';
import { User } from './types';

const mockUser: User = {
  id: 'demo',
  email: 'demo@user.com',
  name: 'Demo User',
  balance: 100000,
  joinedAt: new Date(),
  totalBets: 5,
  winRate: 60,
  kycStatus: 'verified',
  bankAccounts: [],
  riskProfile: 'moderate',
  tradingExperience: 'intermediate',
};

function App() {
  return <Dashboard user={mockUser} onLogout={() => {}} />;
}

export default App;