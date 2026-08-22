import { SESSION_MAX_AGE, issueToken, safeEqual, sessionCookie } from '@/lib/server/auth';
import { env } from '@/lib/server/env';
import { json, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** Sign in: the one password opens a 12-hour session. */
export async function POST(req: Request) {
  const body = await readJson<{ password?: string }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);
  const { ADMIN_PASSWORD, SESSION_SECRET } = env();
  if (!ADMIN_PASSWORD || !SESSION_SECRET) {
    return json({ error: 'Server is missing ADMIN_PASSWORD or SESSION_SECRET.' }, 500);
  }
  if (!safeEqual(String(body.password ?? ''), ADMIN_PASSWORD)) {
    // Flat cost on every failure, so guessing is throttled at the source.
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: 'Wrong password.' }, 401);
  }
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(await issueToken(), SESSION_MAX_AGE) });
}

/** Sign out. */
export async function DELETE() {
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}
