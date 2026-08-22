/**
 * The panel's session token, as a pure function of (secret, expiry): no
 * bindings, no request context, so the follow-up clock (a Durable Object,
 * outside Next.js) can mint one exactly the way the sign-in route does.
 *
 * Format: `exp.signature`, where exp is a UNIX-seconds expiry and the
 * signature is HMAC-SHA256 of `admin|exp` under SESSION_SECRET, base64url
 * with no padding. Changing SESSION_SECRET invalidates every token at once.
 */

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signSession(secret: string, exp: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = b64url(await crypto.subtle.sign('HMAC', key, enc.encode(`admin|${exp}`)));
  return `${exp}.${sig}`;
}
