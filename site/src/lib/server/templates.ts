import { SITE_URL } from '@/config/site';

// Base58: no 0/O/I/l, so a token read off a phone screen is never ambiguous.
const B58 = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = '';
  for (const b of bytes) out += B58[b % B58.length];
  return out;
}

/** {{name}}, {{phone}}, {{link}}, {{product}}. An unknown placeholder resolves to nothing. */
export function fill(template: unknown, vars: Record<string, unknown>) {
  return String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    vars[key] == null ? '' : String(vars[key]),
  );
}

/** The tracked short link every review text carries. Never the Google URL directly. */
export function reviewLink(token: string) {
  return `${SITE_URL.replace(/\/+$/, '')}/r/${token}`;
}

export function panelLink(quoteId: number) {
  return `${SITE_URL.replace(/\/+$/, '')}/admin?r=${quoteId}`;
}

export function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function isoInHours(hours: number) {
  return new Date(Date.now() + hours * 3600000).toISOString().replace(/\.\d{3}Z$/, 'Z');
}
