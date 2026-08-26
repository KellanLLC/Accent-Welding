import { afterResponse, db } from '@/lib/server/env';
import { keepClockRunning } from '@/lib/server/followups';
import { json, readJson, sameOrigin, str } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { floodGuardTripped, insertQuote, sendOwnerAlert } from '@/lib/server/quotes';
import { type Enquiry, reportSpam, scanEnquiry } from '@/lib/server/spamscan';

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

// The pitch words no railing customer ever types. A submission that picks the
// "Marketing / SEO" bait option on the contact form, or whose text reads like
// the cold pitch, gets the honeypot treatment: a cheerful yes, then nothing.
// No row in the panel, no text to anyone.
const SPAM_TELLS = [
  /\bseo\b/i,
  /search engine optimi[sz]ation/i,
  /\bbacklinks?\b/i,
  /digital marketing/i,
  /marketing (?:services|agency|team|expert)/i,
  /(?:web|website) (?:design|development) (?:services|agency|company)/i,
  /rank(?:ing)? (?:on|in) google/i,
  /first page of google/i,
  /lead generation/i,
];

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'Origin not allowed.' }, 403);

  const body = await readJson<Payload>(req);
  if (!body) return json({ ok: false, error: 'Bad JSON' }, 400);

  const product = str(body.product, 120);
  const notes = str(body.notes, 4000);
  const enquiry: Enquiry = {
    product,
    notes,
    name: str(body.name, 120),
    phone: str(body.phone, 40),
    email: str(body.email, 160),
    town: str(body.where, 120),
  };

  if (str(body.website, 50)) {
    afterResponse(reportSpam('Hidden honeypot field (bot)', '', enquiry), 'spam report');
    return json({ ok: true });
  }
  if (/^marketing/i.test(product)) {
    afterResponse(reportSpam('Picked the Marketing / SEO bait option', '', enquiry), 'spam report');
    return json({ ok: true });
  }
  const tell = SPAM_TELLS.find((t) => t.test(`${product} ${notes}`));
  if (tell) {
    afterResponse(reportSpam('Keyword match', String(tell), enquiry), 'spam report');
    return json({ ok: true });
  }

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
    product: product || 'Enquiry',
    spec: Array.isArray(body.spec)
      ? body.spec.slice(0, 40).map((r) => ({ key: str(r?.key, 80), value: str(r?.value, 200) }))
      : [],
    price: str(body.price, 200),
    name,
    phone,
    phoneRaw,
    email,
    town,
    notes,
    source,
    ip,
    userAgent: (req.headers.get('User-Agent') || '').slice(0, 400),
  });

  // The AI layer runs after the response is out, so the customer never waits
  // on Gemini. A spam verdict pulls the row back out of the panel and posts
  // it to Discord instead of texting the owner; anything else — including the
  // scan failing — goes to the owner as normal.
  if (inserted) {
    const id = inserted.id;
    afterResponse(
      (async () => {
        const verdict = await scanEnquiry(enquiry);
        if (verdict?.spam) {
          await db().prepare('DELETE FROM quotes WHERE id = ?1').bind(id).run();
          await reportSpam('AI scan', verdict.reason, enquiry);
          return;
        }
        await sendOwnerAlert(id, name, phoneRaw, product || 'Enquiry');
      })(),
      'spam scan',
    );
  }
  afterResponse(keepClockRunning(), 'clock');

  return json({ ok: true, id: inserted?.id });
}
