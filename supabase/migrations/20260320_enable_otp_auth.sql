-- ============================================================================
-- ENABLE OTP AUTHENTICATION IN SUPABASE
-- Run this in Supabase SQL Editor AFTER the main migration
-- ============================================================================

-- 1. The handle_new_user trigger already creates profile + wallet on signup.
--    OTP auth calls signInWithOtp which creates the user automatically,
--    so the trigger fires on first OTP verification — no changes needed.

-- 2. Verify the trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- 3. Verify the handle_new_user function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- ============================================================================
-- SUPABASE DASHBOARD SETTINGS (do these manually):
-- ============================================================================
-- 1. Go to: Authentication → Providers → Email
--    ✅ Enable Email provider
--    ✅ Turn OFF "Confirm email" (for dev)
--    ✅ Turn ON "Enable email OTP" (if available)
--
-- 2. Go to: Authentication → Email Templates
--    Set "Magic Link" / "OTP" template subject to: "Your StockBet OTP Code"
--
-- 3. For Phone OTP (optional):
--    Go to: Authentication → Providers → Phone
--    Enable and configure Twilio credentials
-- ============================================================================

-- 4. Check existing users and their profiles
SELECT
  u.id,
  u.email,
  u.phone,
  u.created_at,
  p.display_name,
  w.balance
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.wallets w ON w.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
