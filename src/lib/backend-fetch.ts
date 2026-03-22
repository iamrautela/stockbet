import { supabase } from '@/integrations/supabase/client';

/**
 * When true, data mutations and reads that have a server route go through /api on the same origin (Vercel).
 * In local `vite` dev this is false unless VITE_USE_VERCEL_API=true (use `vercel dev` for /api).
 */
export function backendApiEnabled(): boolean {
  if (import.meta.env.VITE_USE_VERCEL_API === 'false') return false;
  if (import.meta.env.VITE_USE_VERCEL_API === 'true') return true;
  return import.meta.env.PROD;
}

/** Optional absolute API origin; empty = same origin (correct for Vercel + static on one deployment). */
export function apiBaseUrl(): string {
  const b = import.meta.env.VITE_API_BASE_URL;
  return typeof b === 'string' ? b.replace(/\/$/, '') : '';
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const base = apiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const { json: jsonBody, body, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (jsonBody !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : body,
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      typeof parsed === 'object' && parsed && 'error' in parsed
        ? String((parsed as { error: string }).error)
        : res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return parsed as T;
}
