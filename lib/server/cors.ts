import type { VercelResponse } from '@vercel/node';

const ALLOW_HEADERS =
  'authorization, content-type, x-client-info, apikey, x-cron-secret';

export function corsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Access-Control-Max-Age': '86400',
  };
}

export function sendJson(
  res: VercelResponse,
  status: number,
  body: unknown,
  extraHeaders?: Record<string, string>
) {
  res.status(status).setHeader('Content-Type', 'application/json');
  const h = corsHeaders();
  for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  }
  res.send(JSON.stringify(body));
}

export function handleOptions(res: VercelResponse) {
  const h = corsHeaders();
  for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  res.status(204).end();
}
