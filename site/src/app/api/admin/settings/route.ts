import { guarded } from '@/lib/server/auth';
import { json, readJson } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { FLAG_KEYS, TEXT_KEYS, readSettings, writeSetting } from '@/lib/server/settings';

export const dynamic = 'force-dynamic';

export const POST = guarded(async (req: Request) => {
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);

  if (typeof body.owner_phone === 'string') {
    const trimmed = body.owner_phone.trim();
    if (trimmed && !normalisePhone(trimmed)) return json({ error: 'That owner number is not valid.' }, 400);
    await writeSetting('owner_phone', trimmed ? normalisePhone(trimmed)! : '');
  }

  if (typeof body.google_review_url === 'string' && body.google_review_url.trim()) {
    try {
      const u = new URL(body.google_review_url.trim());
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    } catch {
      return json({ error: 'The Google review link has to be a full https:// address.' }, 400);
    }
  }

  for (const key of TEXT_KEYS) {
    if (typeof body[key] === 'string') await writeSetting(key, (body[key] as string).trim().slice(0, 1200));
  }
  for (const key of FLAG_KEYS) {
    if (typeof body[key] === 'boolean') await writeSetting(key, body[key] ? '1' : '0');
  }

  for (const step of [1, 2, 3]) {
    const key = `followup_${step}_hours`;
    const v = body[key];
    if (v === '' || v === null) {
      await writeSetting(key, ''); // blank switches that rung off
    } else if (v != null) {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0 || n > 8760) {
        return json({ error: `Follow-up ${step} needs a number of hours between 1 and 8760.` }, 400);
      }
      await writeSetting(key, String(Math.round(n)));
    }
  }

  if (body.screening_threshold != null && body.screening_threshold !== '') {
    const n = Number(body.screening_threshold);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return json({ error: 'The star threshold has to be between 1 and 5.' }, 400);
    }
    await writeSetting('screening_threshold', String(n));
  }

  return json({ ok: true, settings: await readSettings() });
});
