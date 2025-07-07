import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/auth/AuthModal';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'phone' | 'forgot'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          balance: session.user.user_metadata?.balance || 10000,
          joinedAt: new Date(session.user.created_at),
          totalBets: session.user.user_metadata?.total_bets || 0,
          winRate: session.user.user_metadata?.win_rate || 0
        };
        setUser(userData);
        setShowAuthModal(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const { user: authUser } = await authService.getCurrentUser();
      
      if (authUser) {
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          balance: authUser.user_metadata?.balance || 10000,
          joinedAt: new Date(authUser.created_at),
          totalBets: authUser.user_metadata?.total_bets || 0,
          winRate: authUser.user_metadata?.win_rate || 0
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuth = (mode: 'login' | 'register' | 'phone' | 'forgot') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />
      
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <>
          <LandingPage onOpenAuth={openAuth} />
          {showAuthModal && (
            <AuthModal
              mode={authMode}
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => setShowAuthModal(false)}
              onSwitchMode={(mode) => setAuthMode(mode)}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;