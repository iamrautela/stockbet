-- Server-only helper for Vercel API: detect if an email already exists in auth.users
CREATE OR REPLACE FUNCTION public.is_registered_email(email_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE lower(u.email) = lower(trim(email_check))
  );
$$;

REVOKE ALL ON FUNCTION public.is_registered_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_registered_email(text) TO service_role;
