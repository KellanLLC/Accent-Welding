import { env } from './env';
import { json } from './http';

/**
 * Panel sessions. One password (the ADMIN_PASSWORD secret) opens the panel;
 * a signed, expiring cookie keeps it open. The cookie is `exp.signature`
 * where the signature is an HMAC of the expiry under SESSION_SECRET, so
 * changing that secret signs everyone out at once.
 */

export const COOKIE_NAME = 'aw_session';
const SESSION_TTL = 60 * 60 * 12; // 12 hours
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Compares in time independent of where the first difference falls. */
export function safeEqual(a: unknown, b: unknown) {
  const x = String(a);
  const y = String(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

export async function issueToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  return `${exp}.${await hmac(env().SESSION_SECRET, `admin|${exp}`)}`;
}

export async function tokenValid(token: string | null) {
  const secret = env().SESSION_SECRET;
  if (!token || !secret) return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, await hmac(secret, `admin|${exp}`));
}

export function readCookie(req: Request, name: string) {
  const raw = req.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export function sessionCookie(value: string, maxAge: number) {
  return [`${COOKIE_NAME}=${value}`, 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', `Max-Age=${maxAge}`].join(
    '; ',
  );
}

export const SESSION_MAX_AGE = SESSION_TTL;

/** Null when signed in; a 401 response to return otherwise. */
export async function requireAuth(req: Request): Promise<Response | null> {
  const ok = await tokenValid(readCookie(req, COOKIE_NAME));
  return ok ? null : json({ error: 'Not signed in.' }, 401);
}

/**
 * Wraps a panel route handler: refuses anyone without a session, and turns an
 * unexpected throw into a plain 500 instead of a stack trace.
 */
export function guarded<C>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const denied = await requireAuth(req);
    if (denied) return denied;
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error('[admin]', err instanceof Error ? err.stack : err);
      return json({ error: 'Something broke on our end.' }, 500);
    }
  };
}
