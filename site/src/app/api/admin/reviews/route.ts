import { guarded } from '@/lib/server/auth';
import { json, readJson } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { createReviewRequest } from '@/lib/server/reviews';

export const dynamic = 'force-dynamic';

/** Send one review request. The attempt is logged whether or not it goes through. */
export const POST = guarded(async (req: Request) => {
  const body = await readJson<{ phone?: string; message?: string; name?: string; quote_id?: number }>(req);
  if (!body) return json({ error: 'Expected JSON.' }, 400);

  const phone = normalisePhone(body.phone);
  if (!phone) return json({ error: 'That phone number is not valid.' }, 400);
  const message = String(body.message ?? '').trim().slice(0, 1200);
  if (!message) return json({ error: 'The message is empty.' }, 400);

  const result = await createReviewRequest({
    phone,
    message,
    name: String(body.name ?? '').trim().slice(0, 120) || null,
    quoteId: Number.isInteger(body.quote_id) ? (body.quote_id as number) : null,
  });

  // 502 when the send failed, so the panel can show it plainly — the attempt
  // is logged either way, which is the point of keeping a history.
  return json({ ok: result.ok, review: result.review, error: result.error }, result.ok ? 200 : 502);
});
