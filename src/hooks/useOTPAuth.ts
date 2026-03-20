import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveOTPSession, clearOTPSession, detectType } from '@/lib/otpStore';

type Step = 'contact' | 'otp' | 'success';

export function useOTPAuth() {
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState('');
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
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resendSeconds]);

  const startResendTimer = () => setResendSeconds(30);

  const sendOTP = async (value: string) => {
    setError('');
    const trimmed = value.trim();
    const type = detectType(trimmed);

    if (!type) {
      setError('Enter a valid email address (e.g. you@gmail.com)');
      return;
    }

    // Phone OTP requires Twilio — guide user to email
    if (type === 'phone') {
      setError('Phone OTP requires Twilio configured in Supabase. Please use your email address instead.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      setContact(trimmed);
      setContactType('email');
      saveOTPSession(trimmed, 'email');
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    setError('');
    if (otp.length !== 6) { setError('Please enter all 6 digits.'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: contact,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      clearOTPSession();
      setStep('success');
    } catch (err: any) {
      setError(mapError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendSeconds > 0) return;
    await sendOTP(contact);
  };

  const goBack = () => {
    setStep('contact');
    setError('');
    clearOTPSession();
  };

  return { step, contact, contactType, loading, error, resendSeconds, sendOTP, verifyOTP, resendOTP, goBack, setError };
}

function mapError(msg: string): string {
  if (!msg) return 'Something went wrong. Please try again.';
  if (msg.includes('Invalid API key') || msg.includes('apikey') || msg.toLowerCase().includes('unauthorized'))
    return 'Invalid Supabase API key. Go to Supabase Dashboard → Settings → API, copy the anon key (eyJhbGci...) and update your .env file.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many attempts. Please wait a minute and try again.';
  if (msg.includes('invalid') && msg.includes('otp'))
    return 'Incorrect OTP. Please check and try again.';
  if (msg.includes('expired'))
    return 'OTP has expired. Please request a new one.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch'))
    return 'Network error. Check your internet connection and try again.';
  if (msg.includes('Email not confirmed'))
    return 'Check your email for the OTP code and enter it below.';
  return msg;
}
