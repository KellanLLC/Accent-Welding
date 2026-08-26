import { afterResponse, db } from '@/lib/server/env';
import { keepClockRunning } from '@/lib/server/followups';
import { json, readJson, sameOrigin, str } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { floodGuardTripped, insertQuote, sendOwnerAlert } from '@/lib/server/quotes';
import { type Enquiry, reportScanDown, reportSpam, scanEnquiry } from '@/lib/server/spamscan';

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

  const ip = req.headers.get('CF-Connecting-IP') || '';
  const userAgent = (req.headers.get('User-Agent') || '').slice(0, 400);
  const source: 'builder' | 'contact' | 'piece' =
    body.source === 'contact' || body.source === 'piece' ? body.source : 'builder';

  // A caught submission is stored flagged — hidden from Requests, shown behind
  // the panel's "Check spam" — and posted to Discord, and the sender is told
  // "got it" all the same. No text goes to anyone.
  const trapped = async (via: string, reason: string) => {
    await insertQuote({
      product: product || 'Enquiry',
      spec: [],
      price: '',
      name: enquiry.name,
      phone: normalisePhone(enquiry.phone) || enquiry.phone,
      phoneRaw: enquiry.phone,
      email: enquiry.email,
      town: enquiry.town,
      notes,
      source,
      ip,
      userAgent,
      spam: { via, reason },
    }).catch((err) => console.error('[spam insert]', err instanceof Error ? err.message : err));
    afterResponse(reportSpam(via, reason, enquiry), 'spam report');
    return json({ ok: true });
  };

  if (str(body.website, 50)) return trapped('Hidden honeypot field (bot)', '');
  if (/^marketing/i.test(product)) return trapped('Picked the Marketing / SEO bait option', '');
  const tell = SPAM_TELLS.find((t) => t.test(`${product} ${notes}`));
  if (tell) return trapped('Keyword match', String(tell));

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

  if (await floodGuardTripped(ip)) {
    return json({ ok: false, error: 'Too many requests. Please call us instead.' }, 429);
  }

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
    userAgent,
  });

  // The AI layer runs after the response is out, so the customer never waits
  // on Gemini. A spam verdict flags the row — out of Requests, into the
  // panel's spam list — and posts it to Discord instead of texting the owner;
  // anything else — including the scan failing — goes to the owner as normal.
  if (inserted) {
    const id = inserted.id;
    afterResponse(
      (async () => {
        const result = await scanEnquiry(enquiry);
        if ('spam' in result && result.spam) {
          await db()
            .prepare('UPDATE quotes SET spam_via = ?1, spam_reason = ?2 WHERE id = ?3')
            .bind('AI scan', result.reason || null, id)
            .run();
          await reportSpam('AI scan', result.reason, enquiry);
          return;
        }
        // A broken scan never blocks a lead — it goes to the owner as normal,
        // and the channel gets told it went through unscreened.
        if ('failed' in result) {
          await reportScanDown(result.failed, enquiry).catch((err) =>
            console.error('[spam report]', err instanceof Error ? err.message : err),
          );
        }
        await sendOwnerAlert(id, name, phoneRaw, product || 'Enquiry');
      })(),
      'spam scan',
    );
  }
  afterResponse(keepClockRunning(), 'clock');

  return json({ ok: true, id: inserted?.id });
}
