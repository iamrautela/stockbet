import React, { useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import Dashboard from './components/Dashboard';
import { authService } from './services/authService';
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

const App: React.FC = () => {
  const [showAuth, setShowAuth] = useState(true);
  const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'forgot'>('login');
  const user = authService.getCurrentUser();

  return (
    <div>
      {!user && showAuth && (
        <AuthModal
          mode={mode}
          onClose={() => setShowAuth(false)}
          onSuccess={() => window.location.reload()}
          onSwitchMode={setMode}
        />
      )}
      {user && <Dashboard user={mockUser} onLogout={() => {}} />}
    </div>
  );
};

export default App;