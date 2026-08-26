import { env } from './env';

/**
 * The AI layer of the spam trap. Every submission that gets past the hidden
 * honeypot and the SPAM_TELLS regexes is shown to Gemini, which answers one
 * question: is this a customer, or a cold pitch aimed at the shop? Blocked
 * submissions are posted to a private Discord channel so a human can overrule
 * a wrong call.
 *
 * The scan runs AFTER the customer's response has gone out (see /api/quote),
 * so it can never slow a submission down — and every failure path (no key,
 * quota, timeout, garbage output) fails OPEN: a missed spam is annoying, a
 * lost customer is worse.
 */

export type Enquiry = {
  product: string;
  name: string;
  phone: string;
  email: string;
  town: string;
  notes: string;
};

const MODEL = 'gemini-3.5-flash-lite';

const INSTRUCTIONS = `You screen contact-form submissions for Accent Welding, a small welding shop in Utah County that builds railings, fencing, gates, garden boxes and custom fabrication for homeowners and businesses.

Decide whether the submission is a genuine customer enquiry, or unsolicited spam pitched AT the shop: SEO or marketing offers, web design, review/testimonial services, lead generation, link building, directory listings, app development, business loans, or any other cold pitch selling services to the business. A real customer asks about metalwork; a spammer offers to help the business.

Reply with JSON only: {"spam": true or false, "reason": "one short sentence"}. If genuinely unsure, say spam=false - a missed spam is annoying, a lost customer is worse.`;

/** Asks Gemini for a verdict. `null` means "could not tell" — treat as clean. */
export async function scanEnquiry(q: Enquiry): Promise<{ spam: boolean; reason: string } | null> {
  const key = env().GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: INSTRUCTIONS }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Product: ${q.product}\nName: ${q.name}\nEmail: ${q.email}\nTown: ${q.town}\nMessage: ${q.notes}`,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json', temperature: 0, maxOutputTokens: 400 },
        }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error('[spam scan]', `Gemini said ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const verdict = JSON.parse(text) as { spam?: unknown; reason?: unknown };
    if (typeof verdict.spam !== 'boolean') return null;
    return { spam: verdict.spam, reason: typeof verdict.reason === 'string' ? verdict.reason : '' };
  } catch (err) {
    console.error('[spam scan]', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Posts a blocked submission to the Discord channel, so a human sees every call the trap makes. */
export async function reportSpam(via: string, reason: string, q: Enquiry): Promise<void> {
  const url = env().SPAM_WEBHOOK_URL;
  if (!url) return;
  const field = (v: string) => v.slice(0, 1000) || '—';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: 'Accent spam trap',
      embeds: [
        {
          title: `Blocked: ${field(q.product)}`,
          description: field(q.notes).slice(0, 1500),
          color: 0xb8542e,
          fields: [
            { name: 'Name', value: field(q.name), inline: true },
            { name: 'Phone', value: field(q.phone), inline: true },
            { name: 'Email', value: field(q.email), inline: true },
            { name: 'Town', value: field(q.town), inline: true },
            { name: 'Caught by', value: field(via), inline: true },
            { name: 'Why', value: field(reason || 'n/a'), inline: false },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error('[spam report]', `Discord said ${res.status}`);
}
