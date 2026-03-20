// Client-side OTP session store (in-memory, per browser tab)
// Tracks the contact and expiry for UX purposes only.
// Actual OTP validation is handled server-side by Supabase.

interface OTPSession {
  contact: string;
  type: 'email' | 'phone';
  sentAt: number;
}

let session: OTPSession | null = null;

export function saveOTPSession(contact: string, type: 'email' | 'phone') {
  session = { contact, type, sentAt: Date.now() };
}

export function getOTPSession(): OTPSession | null {
  return session;
}

export function clearOTPSession() {
  session = null;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value.trim());
}

export function detectType(contact: string): 'email' | 'phone' | null {
  if (isEmail(contact)) return 'email';
  if (isPhone(contact)) return 'phone';
  return null;
}
