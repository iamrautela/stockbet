import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkEmailRegistered } from '@/lib/auth-email-check';
import { saveOTPSession, clearOTPSession, detectType } from '@/lib/otpStore';

type Step = 'email' | 'signup' | 'otp';
type Flow = 'login' | 'signup';

function mapError(msg: string): string {
  if (!msg) return 'Something went wrong. Please try again.';
  if (msg.includes('Invalid API key') || msg.includes('apikey') || msg.toLowerCase().includes('unauthorized'))
    return 'Invalid Supabase API key. Use the anon JWT from Supabase Dashboard → Settings → API in your .env file.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many attempts. Please wait a minute and try again.';
  if (msg.includes('invalid') && msg.includes('otp'))
    return 'Incorrect OTP. Please check and try again.';
  if (msg.includes('expired'))
    return 'OTP has expired. Please request a new one.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch'))
    return 'Network error. Check your connection and try again.';
  if (msg.includes('Email not confirmed'))
    return 'Check your email for the OTP code and enter it below.';
  return msg;
}

function getErrMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
    return (err as Error).message;
  }
  return String(err);
}

export function useOTPAuth() {
  const [step, setStep] = useState<Step>('email');
  const [flow, setFlow] = useState<Flow>('login');
  const [contact, setContact] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendSeconds]);

  const startResendTimer = () => setResendSeconds(30);

  const sendLoginOtp = async (email: string) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (otpError) throw otpError;
  };

  const sendSignupOtp = async (email: string, name: string) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          display_name: name.trim(),
          full_name: name.trim(),
        },
      },
    });
    if (otpError) throw otpError;
  };

  /** Step 1: validate email and branch login vs signup */
  const submitEmail = async (value: string) => {
    setError('');
    const trimmed = value.trim();
    const type = detectType(trimmed);

    if (!type) {
      setError('Enter a valid email address (e.g. you@gmail.com)');
      return;
    }

    if (type === 'phone') {
      setError('Use your email address to sign in or sign up.');
      return;
    }

    setLoading(true);
    try {
      setContact(trimmed);
      setContactType('email');

      const registered = await checkEmailRegistered(trimmed);

      if (registered === true) {
        setFlow('login');
        await sendLoginOtp(trimmed);
        saveOTPSession(trimmed, 'email');
        setStep('otp');
        startResendTimer();
        return;
      }

      if (registered === false) {
        setFlow('signup');
        setDisplayName('');
        setStep('signup');
        return;
      }

      // API unavailable: one attempt — existing users get a login OTP; otherwise show signup
      const { error: loginErr } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: false },
      });

      if (!loginErr) {
        setFlow('login');
        saveOTPSession(trimmed, 'email');
        setStep('otp');
        startResendTimer();
        return;
      }

      setFlow('signup');
      setDisplayName('');
      setStep('signup');
    } catch (err: unknown) {
      setError(mapError(getErrMessage(err)));
    } finally {
      setLoading(false);
    }
  };

  /** Step signup: collect name then send verification OTP */
  const submitSignupDetails = async (name: string, email: string) => {
    setError('');
    const n = name.trim();
    if (n.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      setDisplayName(n);
      setContact(email.trim().toLowerCase());
      setFlow('signup');
      await sendSignupOtp(email.trim().toLowerCase(), n);
      saveOTPSession(email.trim().toLowerCase(), 'email');
      setStep('otp');
      startResendTimer();
    } catch (err: unknown) {
      setError(mapError(getErrMessage(err)));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setError('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: contact,
        token: otp,
        type: 'email',
      });
      if (verifyError) throw verifyError;

      clearOTPSession();
      // Session is live; Index will swap to dashboard — no separate success step
    } catch (err: unknown) {
      setError(mapError(getErrMessage(err)));
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendSeconds > 0 || !contact) return;
    setLoading(true);
    setError('');
    try {
      if (flow === 'login') {
        await sendLoginOtp(contact);
      } else {
        await sendSignupOtp(contact, displayName || contact.split('@')[0]);
      }
      startResendTimer();
    } catch (err: unknown) {
      setError(mapError(getErrMessage(err)));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep(flow === 'login' ? 'email' : 'signup');
      setError('');
      return;
    }
    if (step === 'signup') {
      setStep('email');
      setDisplayName('');
      setError('');
      clearOTPSession();
      return;
    }
    setError('');
    clearOTPSession();
  };

  const goToEmailFromSignup = () => {
    setStep('email');
    setDisplayName('');
    setError('');
    clearOTPSession();
  };

  return {
    step,
    flow,
    contact,
    displayName,
    contactType,
    loading,
    error,
    resendSeconds,
    submitEmail,
    submitSignupDetails,
    verifyOTP,
    resendOTP,
    goBack,
    goToEmailFromSignup,
    setError,
  };
}
