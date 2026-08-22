import { afterResponse } from '@/lib/server/env';
import { keepClockRunning } from '@/lib/server/followups';
import { json, readJson, sameOrigin, str } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { floodGuardTripped, insertQuote, notifyOwnerOfQuote } from '@/lib/server/quotes';

export const dynamic = 'force-dynamic';

/**
 * Quote intake, for the four builders, the contact form, and "ask about this
 * piece" on a listed item. Every submission is written to the `quotes` table
 * in D1 and shows up in the panel at /admin the moment it lands; the owner is
 * texted after the response has gone out, so a GoHighLevel outage can never
 * fail a customer's submission.
 */

type Payload = {
  product?: string;
  spec?: { key: string; value: string }[];
  price?: string;
  name?: string;
  phone?: string;
  email?: string;
  where?: string;
  notes?: string;
  source?: string;
  website?: string; // honeypot: people never see it, bots fill everything
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'Origin not allowed.' }, 403);

  const body = await readJson<Payload>(req);
  if (!body) return json({ ok: false, error: 'Bad JSON' }, 400);

  if (str(body.website, 50)) return json({ ok: true });

  const name = str(body.name, 120);
  const phoneRaw = str(body.phone, 40);
  const email = str(body.email, 160);
  const town = str(body.where, 120);

  if (!name) return json({ ok: false, error: 'Please enter your name.' }, 422);
  const phone = normalisePhone(phoneRaw);
  if (!phone) return json({ ok: false, error: 'Please enter a valid phone number.' }, 422);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'That email address does not look right.' }, 422);
  }

  const ip = req.headers.get('CF-Connecting-IP') || '';
  if (await floodGuardTripped(ip)) {
    return json({ ok: false, error: 'Too many requests. Please call us instead.' }, 429);
  }

  const source: 'builder' | 'contact' | 'piece' =
    body.source === 'contact' || body.source === 'piece' ? body.source : 'builder';

  const inserted = await insertQuote({
    product: str(body.product, 120) || 'Enquiry',
    spec: Array.isArray(body.spec)
      ? body.spec.slice(0, 40).map((r) => ({ key: str(r?.key, 80), value: str(r?.value, 200) }))
      : [],
    price: str(body.price, 200),
    name,
    phone,
    phoneRaw,
    email,
    town,
    notes: str(body.notes, 4000),
    source,
    ip,
    userAgent: (req.headers.get('User-Agent') || '').slice(0, 400),
  });

  if (inserted) notifyOwnerOfQuote(inserted.id, name, phoneRaw, str(body.product, 120) || 'Enquiry');
  afterResponse(keepClockRunning(), 'clock');

  return json({ ok: true, id: inserted?.id });
}
