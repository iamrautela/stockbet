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

  // Countdown timer for resend
  useEffect(() => {
    if (resendSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
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
      setError('Enter a valid email or phone number in E.164 format (e.g. +919876543210)');
      return;
    }

    setLoading(true);
    try {
      if (type === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: trimmed,
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
      }

      setContact(trimmed);
      setContactType(type);
      saveOTPSession(trimmed, type);
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
    if (otp.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (contactType === 'email') {
        result = await supabase.auth.verifyOtp({
          email: contact,
          token: otp,
          type: 'email',
        });
      } else {
        result = await supabase.auth.verifyOtp({
          phone: contact,
          token: otp,
          type: 'sms',
        });
      }

      if (result.error) throw result.error;

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

  return {
    step,
    contact,
    contactType,
    loading,
    error,
    resendSeconds,
    sendOTP,
    verifyOTP,
    resendOTP,
    goBack,
    setError,
  };
}

function mapError(msg: string): string {
  if (!msg) return 'Something went wrong. Please try again.';
  if (
    msg.includes('Invalid API key') ||
    msg.includes('apikey') ||
    msg.includes('invalid key') ||
    msg.toLowerCase().includes('unauthorized')
  )
    return 'Invalid API key — please copy the correct anon key from Supabase Dashboard → Settings → API and paste it into your .env file as VITE_SUPABASE_PUBLISHABLE_KEY, then restart the dev server.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Too many attempts. Please wait a minute and try again.';
  if (msg.includes('invalid') && msg.includes('otp'))
    return 'Incorrect OTP. Please check and try again.';
  if (msg.includes('expired'))
    return 'OTP has expired. Please request a new one.';
  if (msg.includes('phone') || msg.includes('sms'))
    return 'Phone OTP requires Twilio set up in Supabase. Use your email address instead.';
  if (msg.includes('not authorized') || msg.includes('signup'))
    return 'Sign ups are disabled. Contact the administrator.';
  if (msg.includes('fetch') || msg.includes('network'))
    return 'Network error. Check your internet connection and try again.';
  return msg;
}
