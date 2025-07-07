import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/auth/AuthModal';
import LoadingFallback from './components/LoadingFallback';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'phone' | 'forgot'>('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthState();
    
    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      if (event === 'SIGNED_IN' && session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          balance: session.user.user_metadata?.balance || 10000,
          joinedAt: new Date(session.user.created_at),
          totalBets: session.user.user_metadata?.total_bets || 0,
          winRate: session.user.user_metadata?.win_rate || 0,
          kycStatus: session.user.user_metadata?.kyc_status || 'pending',
          bankAccounts: [],
          riskProfile: 'moderate',
          tradingExperience: 'beginner'
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
      console.log('Checking auth state...');
      const { user: authUser, error: authError } = await authService.getCurrentUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        setError(authError);
      } else if (authUser) {
        console.log('User found:', authUser);
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          balance: authUser.user_metadata?.balance || 10000,
          joinedAt: new Date(authUser.created_at),
          totalBets: authUser.user_metadata?.total_bets || 0,
          winRate: authUser.user_metadata?.win_rate || 0,
          kycStatus: authUser.user_metadata?.kyc_status || 'pending',
          bankAccounts: [],
          riskProfile: 'moderate',
          tradingExperience: 'beginner'
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
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
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Configuration Error
          </h1>
          <p className="text-gray-300 mb-4">
            There's an issue with the application configuration. Please check the console for details.
          </p>
          <details className="text-sm text-gray-400 mb-4">
            <summary className="cursor-pointer mb-2">Error Details</summary>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto">
              {error}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
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