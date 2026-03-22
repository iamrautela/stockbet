import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Mail, AlertTriangle, ArrowLeft, RefreshCw, Loader2, UserPlus, LogIn, User,
} from 'lucide-react';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { OTPInput } from '@/components/auth/OTPInput';

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22 },
};

const AuthPage = () => {
  const {
    step, flow, contact, loading, error,
    resendSeconds, submitEmail, submitSignupDetails, verifyOTP, resendOTP, goBack, setError,
  } = useOTPAuth();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === 'email') setOtpDigits(Array(6).fill(''));
  }, [step]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEmail(emailInput);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSignupDetails(nameInput, contact);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP(otpDigits.join(''));
  };

  const otpTitle = flow === 'login' ? 'Sign in' : 'Verify your email';
  const otpSubtitle =
    flow === 'login'
      ? 'Enter the 6-digit code we sent to sign in.'
      : 'Enter the 6-digit code to confirm your account.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">StockBet</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time stock betting platform</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">

            {step === 'email' && (
              <motion.div key="email" {...slide} className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Enter your email</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  We&apos;ll check if you already have an account — then sign you in or start signup.
                </p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <input
                        ref={emailRef}
                        type="email"
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setError('');
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        spellCheck={false}
                        className="w-full bg-muted rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !emailInput.trim()}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Checking…
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
                  Registered users receive a login code. New users will set their name next, then get a verification code.
                </p>
              </motion.div>
            )}

            {step === 'signup' && (
              <motion.div key="signup" {...slide} className="p-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Different email
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="w-4 h-4 text-gain" />
                  <h2 className="text-lg font-bold text-foreground">Create your account</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  You&apos;re new here. Add your name — we&apos;ll email a verification code to{' '}
                  <span className="font-semibold text-foreground">{contact}</span>.
                </p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Full name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </span>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setError('');
                        }}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className="w-full bg-muted rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={contact}
                      readOnly
                      className="w-full bg-muted/50 rounded-lg px-4 py-2.5 text-sm text-muted-foreground border border-border/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || nameInput.trim().length < 2}
                    className="w-full py-3 rounded-lg bg-gain text-gain-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending code…
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Send verification code
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" {...slide} className="p-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div className="flex items-center gap-2 mb-1">
                  {flow === 'login' ? (
                    <LogIn className="w-4 h-4 text-primary" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary" />
                  )}
                  <h2 className="text-lg font-bold text-foreground">{otpTitle}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{otpSubtitle}</p>
                <p className="text-sm font-semibold text-primary mb-6 truncate">{contact}</p>

                {error && <ErrorBanner message={error} />}

                <form onSubmit={handleVerify} className="space-y-5">
                  <OTPInput
                    value={otpDigits}
                    onChange={(v) => {
                      setOtpDigits(v);
                      setError('');
                    }}
                    disabled={loading}
                  />

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                      </>
                    ) : (
                      flow === 'login' ? 'Sign in' : 'Verify & continue'
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  {resendSeconds > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Resend in{' '}
                      <span className="text-foreground font-semibold">{resendSeconds}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={resendOTP}
                      disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-primary hover:brightness-110 mx-auto transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend code
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">Code expires in a few minutes</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="flex items-start gap-2 text-xs text-yellow-500/70 mt-4 px-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Simulated trading with virtual credits only. No real money.
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
