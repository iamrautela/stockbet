import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Mail, AlertTriangle,
  ArrowLeft, CheckCircle, RefreshCw, Loader2,
} from 'lucide-react';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { OTPInput } from '@/components/auth/OTPInput';

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
  transition: { duration: 0.22 },
};

const AuthPage = () => {
  const {
    step, contact, contactType, loading, error,
    resendSeconds, sendOTP, verifyOTP, resendOTP, goBack, setError,
  } = useOTPAuth();

  const [contactInput, setContactInput] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const contactRef = useRef<HTMLInputElement>(null);

  // Auto-focus contact input on mount
  useEffect(() => { contactRef.current?.focus(); }, []);

  // Reset OTP digits when going back
  useEffect(() => {
    if (step === 'contact') setOtpDigits(Array(6).fill(''));
  }, [step]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendOTP(contactInput);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP(otpDigits.join(''));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">StockBet</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock betting platform</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Enter email ─────────────────────────────── */}
            {step === 'contact' && (
              <motion.div key="contact" {...slide} className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-1">Get started</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your email to receive a one-time sign-in code.
                </p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleSend} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <input
                        ref={contactRef}
                        type="email"
                        value={contactInput}
                        onChange={(e) => { setContactInput(e.target.value); setError(''); }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        spellCheck={false}
                        className="w-full bg-muted rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !contactInput.trim()}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                      : 'Send OTP'}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  New users are automatically registered on first sign in.
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Enter OTP ─────────────────────────────────── */}
            {step === 'otp' && (
              <motion.div key="otp" {...slide} className="p-6">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change email
                </button>

                <h2 className="text-lg font-bold text-foreground mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-semibold text-primary mb-6 truncate">{contact}</p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleVerify} className="space-y-5">
                  <OTPInput
                    value={otpDigits}
                    onChange={(v) => { setOtpDigits(v); setError(''); }}
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                      : 'Verify OTP'}
                  </button>
                </form>

                {/* Resend */}
                <div className="mt-4 text-center">
                  {resendSeconds > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Resend in <span className="text-foreground font-semibold">{resendSeconds}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={resendOTP}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-primary hover:brightness-110 mx-auto transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  Code expires in 5 minutes
                </p>
              </motion.div>
            )}

            {/* ── STEP 3: Success ───────────────────────────────────── */}
            {step === 'success' && (
              <motion.div key="success" {...slide} className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">You're in!</h2>
                <p className="text-sm text-muted-foreground">
                  Verified successfully. Redirecting to your dashboard...
                </p>
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto mt-4" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-yellow-500/70 mt-4 px-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            This is a simulated trading platform using virtual credits. No real money is involved.
          </span>
        </div>
      </div>
    </div>
  );
};

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{message}</span>
  </div>
);

export default AuthPage;
