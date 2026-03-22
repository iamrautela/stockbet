/**
 * Whether the email is already registered (true/false), or null if the API is unavailable.
 * POST /api/auth/check-email — use `npx vercel dev` + Vite proxy, or deploy to Vercel with the migration applied.
 */
export async function checkEmailRegistered(email: string): Promise<boolean | null> {
  const trimmed = email.trim().toLowerCase();

  try {
    const res = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
    });
    if (res.ok) {
      const j = (await res.json()) as { registered?: boolean };
      return j.registered === true;
    }
  } catch {
    /* unreachable API */
  }

  return null;
}
