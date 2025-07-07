import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Github, Chrome, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/auth';
import toast from 'react-hot-toast';

interface AuthModalProps {
  mode: 'login' | 'register' | 'phone' | 'forgot';
  onClose: () => void;
  onSuccess: () => void;
  onSwitchMode: (mode: 'login' | 'register' | 'phone' | 'forgot') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        
        const { user, error } = await authService.signUp(
          formData.email,
          formData.password,
          formData.name
        );
        
        if (error) {
          toast.error(error);
        } else {
          toast.success('Account created! Please check your email for verification.');
          onSuccess();
        }
      } else if (mode === 'login') {
        const { user, error } = await authService.signIn(formData.email, formData.password);
        
        if (error) {
          toast.error(error);
        } else {
          toast.success('Welcome back!');
          onSuccess();
        }
      } else if (mode === 'forgot') {
        const { error } = await authService.resetPassword(formData.email);
        
        if (error) {
          toast.error(error);
        } else {
          toast.success('Password reset email sent!');
          onSwitchMode('login');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otpSent) {
        const { error } = await authService.sendOTP(formData.phone);
        
        if (error) {
          toast.error(error);
        } else {
          setOtpSent(true);
          toast.success('OTP sent to your phone!');
        }
      } else {
        const { user, error } = await authService.verifyOTP(formData.phone, formData.otp);
        
        if (error) {
          toast.error(error);
        } else {
          toast.success('Phone verified successfully!');
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    
    try {
      const { error } = provider === 'google' 
        ? await authService.signInWithGoogle()
        : await authService.signInWithGitHub();
      
      if (error) {
        toast.error(error);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'register': return 'Create Account';
      case 'phone': return 'Phone Verification';
      case 'forgot': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {mode === 'phone' ? (
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1234567890"
                  required
                  disabled={otpSent}
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Please wait...' : otpSent ? 'Verify OTP' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Please wait...' : 
               mode === 'register' ? 'Create Account' :
               mode === 'forgot' ? 'Send Reset Email' : 'Sign In'}
            </button>
          </form>
        )}

        {mode !== 'forgot' && mode !== 'phone' && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">or continue with</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </button>
              <button
                onClick={() => handleSocialAuth('github')}
                disabled={loading}
                className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => onSwitchMode('register')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Sign up
                </button>
              </p>
              <p className="text-gray-400">
                <button
                  onClick={() => onSwitchMode('forgot')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Forgot password?
                </button>
              </p>
              <p className="text-gray-400">
                <button
                  onClick={() => onSwitchMode('phone')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Sign in with phone
                </button>
              </p>
            </>
          )}
          
          {mode === 'register' && (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
          
          {(mode === 'forgot' || mode === 'phone') && (
            <p className="text-gray-400">
              <button
                onClick={() => onSwitchMode('login')}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;