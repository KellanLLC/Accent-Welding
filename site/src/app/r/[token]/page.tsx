import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Mark } from '@/components/Mark';
import { Star } from '@/components/Star';
import { business } from '@/config/business';
import { afterResponse } from '@/lib/server/env';
import { maybeSweep } from '@/lib/server/followups';
import { findByToken, markClicked } from '@/lib/server/reviews';
import { readSettings } from '@/lib/server/settings';
import s from './rate.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'How did we do?',
  robots: { index: false, follow: false },
};

type State = 'ask' | 'high' | 'low' | 'done' | 'gone';

/**
 * The page behind every review text. Someone opens it on a phone, possibly on
 * bad signal, so there is no JavaScript in it at all: each step is a plain
 * form POST to /api/r/<token> and a redirect back here.
 *
 * Worth knowing: asking for a star before offering the Google link is review
 * gating, and Google's policies prohibit it. It was built at the owner's
 * request and is on by default. Settings → Rating page → off makes this link
 * record the tap and then forward everyone straight to Google, which is the
 * compliant behaviour and keeps the tracking.
 */
export default async function RatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const settings = await readSettings();
  const row = /^[A-Za-z0-9]{6,32}$/.test(token) ? await findByToken(token) : null;

  let state: State = 'gone';
  if (row) {
    await markClicked(row);
    afterResponse(maybeSweep(), 'sweep');

    const google = safeUrl(settings.google_review_url);
    const threshold = Number(settings.screening_threshold || 4);

    // Screening switched off: the tap is already counted, hand them straight on.
    if (settings.screening_enabled !== '1' && google) redirect(google);

    if (row.rating != null) {
      if (row.rating >= threshold) {
        if (google) redirect(google);
        state = 'high';
      } else {
        state = row.feedback ? 'done' : 'low';
      }
    } else {
      state = 'ask';
    }
  }

  const t = (k: string, fallback: string) => settings[k] || fallback;
  const head =
    state === 'high' ? t('screening_high_head', 'Thank you.')
    : state === 'low' ? t('screening_low_head', 'We want to put this right.')
    : state === 'done' ? t('screening_done_head', 'Thank you.')
    : state === 'gone' ? 'This link has expired.'
    : t('screening_headline', 'How did we do?');
  const sub =
    state === 'high' ? t('screening_high_sub', '')
    : state === 'low' ? t('screening_low_sub', '')
    : state === 'done' ? t('screening_done_sub', '')
    : state === 'gone' ? `Call or text ${business.phone} and we will sort it out.`
    : t('screening_sub', '');

  const action = `/api/r/${encodeURIComponent(token)}`;

  return (
    <div className={s.root}>
      <main className={s.card}>
        <div className={s.brand}>
          <Mark size={96} detail />
          <span className={s.word}>ACCENT WELDING</span>
        </div>

        <h1 className={s.head}>{head}</h1>
        {sub ? <p className={s.sub}>{sub}</p> : null}

        {state === 'ask' ? (
          <form method="post" action={action} className={s.starForm}>
            {/* Reversed in the DOM and laid out row-reverse, so a plain CSS
                sibling selector lights every star up to the one under the
                thumb with no script. */}
            <div className={s.stars}>
              {[5, 4, 3, 2, 1].map((n) => (
                <button key={n} type="submit" name="rating" value={n} className={s.star} aria-label={`${n} out of 5`}>
                  <Star size="100%" />
                </button>
              ))}
            </div>
            <p className={s.scale}>
              <span>Rough</span>
              <span>Perfect</span>
            </p>
          </form>
        ) : null}

        {state === 'low' ? (
          <form method="post" action={action} className={s.fb}>
            <textarea
              name="feedback"
              rows={5}
              required
              aria-label="What went wrong"
              placeholder="What happened?"
              className={s.textarea}
            />
            <button type="submit" className={`btn ${s.cta}`}>
              Send it to the shop
            </button>
          </form>
        ) : null}

        {state === 'gone' ? (
          <a href={business.phoneHref} className={`btn ${s.cta}`}>
            Call {business.phone}
          </a>
        ) : null}
      </main>
    </div>
  );
}

function safeUrl(v: unknown) {
  const dest = String(v || '').trim();
  if (!dest) return null;
  try {
    const u = new URL(dest);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
