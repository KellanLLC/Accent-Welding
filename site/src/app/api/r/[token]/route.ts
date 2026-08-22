import { afterResponse, db } from '@/lib/server/env';
import { normalisePhone, prettyPhone } from '@/lib/server/phone';
import { findByToken } from '@/lib/server/reviews';
import { readSettings } from '@/lib/server/settings';
import { sendSms } from '@/lib/server/sms';
import { nowIso } from '@/lib/server/templates';

export const dynamic = 'force-dynamic';

/**
 * The rating page posts here: first a star, then (if it was a low one) a few
 * words. Every answer is a plain form POST and every reply is a redirect, so
 * it works on any phone, with JavaScript off, on a bad connection.
 *
 * 303 everywhere, so the browser turns the POST into a GET on the way out
 * and a refresh never re-submits.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const back = new URL(`/r/${token}`, req.url);
  const settings = await readSettings();
  const row = await findByToken(token);
  if (!row) return Response.redirect(back.toString(), 303);

  const form = await req.formData().catch(() => null);
  if (!form) return Response.redirect(back.toString(), 303);

  const threshold = Number(settings.screening_threshold || 4);
  const feedback = String(form.get('feedback') ?? '').trim().slice(0, 4000);
  const rating = Math.max(0, Math.min(5, Number(form.get('rating')) || 0));

  if (feedback) {
    await db().prepare('UPDATE review_requests SET feedback = ?2 WHERE id = ?1').bind(row.id, feedback).run();

    // Unhappy customer: get it in front of the shop immediately.
    afterResponse(
      (async () => {
        const owner = normalisePhone(settings.owner_phone);
        if (!owner || settings.notify_owner !== '1') return;
        await sendSms(
          owner,
          `${row.rating || rating}-star feedback from ${row.name || prettyPhone(row.phone)} ` +
            `(${prettyPhone(row.phone)}): "${feedback.slice(0, 220)}"`,
        );
      })(),
      'feedback alert',
    );
    return Response.redirect(back.toString(), 303);
  }

  if (!rating) return Response.redirect(back.toString(), 303);

  await db()
    .prepare(
      `UPDATE review_requests
          SET rating = ?2, stopped_at = COALESCE(stopped_at, ?3),
              stop_reason = 'rated', next_due_at = NULL
        WHERE id = ?1`,
    )
    .bind(row.id, rating, nowIso())
    .run();

  // A happy rating goes straight to Google with no page in between.
  if (rating >= threshold) {
    const dest = String(settings.google_review_url || '').trim();
    if (dest) {
      try {
        const u = new URL(dest);
        if (u.protocol === 'https:' || u.protocol === 'http:') return Response.redirect(u.toString(), 303);
      } catch {
        /* a malformed setting falls back to the thank-you page */
      }
    }
  }
  return Response.redirect(back.toString(), 303);
}
