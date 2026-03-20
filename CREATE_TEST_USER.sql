-- ============================================================================
-- CREATE TEST USER MANUALLY
-- Run this in Supabase SQL Editor if sign up still doesn't work
-- ============================================================================

-- This will create a test user that you can use to sign in
-- Email: test@example.com
-- Password: Test123456

-- Note: This is a workaround. The proper fix is to:
-- 1. Disable email confirmation in Auth settings
-- 2. Run the complete migration file first

-- ============================================================================
-- OPTION 1: Use Supabase Dashboard (RECOMMENDED)
-- ============================================================================
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Enter:
--    Email: test@example.com
--    Password: Test123456
--    Auto Confirm User: YES
-- 4. Click "Create User"

-- ============================================================================
-- OPTION 2: Check if migration was run
-- ============================================================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'wallets', 'user_roles', 'notifications');

-- If the above returns 0 rows, you MUST run the migration first!
-- File: supabase/migrations/20260320_complete_schema.sql

-- ============================================================================
-- OPTION 3: Verify triggers are working
-- ============================================================================

-- Check if the trigger function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- If the above returns 0 rows, the migration wasn't run properly

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- 1. Check if any users exist
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if profiles were created for users
SELECT p.user_id, p.display_name, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
LIMIT 5;

-- 3. Check if wallets were created
SELECT w.user_id, w.balance, u.email
FROM public.wallets w
JOIN auth.users u ON u.id = w.user_id
LIMIT 5;

-- 4. Check if user_roles were created
SELECT r.user_id, r.role, u.email
FROM public.user_roles r
JOIN auth.users u ON u.id = r.user_id
LIMIT 5;

-- ============================================================================
-- MANUAL FIX: If user exists but profile/wallet missing
-- ============================================================================

-- Get the user ID (replace with actual user ID from auth.users)
-- SELECT id FROM auth.users WHERE email = 'test@example.com';

-- Then manually create profile, wallet, and role:
-- (Replace 'USER_ID_HERE' with actual UUID)

/*
-- Create profile
INSERT INTO public.profiles (user_id, display_name, preferred_market)
VALUES ('USER_ID_HERE', 'Test User', 'NSE')
ON CONFLICT (user_id) DO NOTHING;

-- Create wallet with welcome bonus
INSERT INTO public.wallets (user_id, balance)
VALUES ('USER_ID_HERE', 10000.00)
ON CONFLICT (user_id) DO NOTHING;

-- Create user role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'user')
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================================================
-- VERIFY EVERYTHING IS WORKING
-- ============================================================================

-- This should return data for your test user
SELECT 
  u.email,
  p.display_name,
  w.balance,
  r.role,
  u.email_confirmed_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.wallets w ON w.user_id = u.id
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email = 'test@example.com';

-- If all columns have data, everything is working!
-- If any are NULL, the triggers didn't fire or migration wasn't run.
