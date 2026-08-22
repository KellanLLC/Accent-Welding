import type { PanelData } from '@/lib/panel-types';
import { guarded } from '@/lib/server/auth';
import { afterResponse, db } from '@/lib/server/env';
import { keepClockRunning } from '@/lib/server/followups';
import { json } from '@/lib/server/http';
import { listItems } from '@/lib/server/items';
import { listQuotes } from '@/lib/server/quotes';
import { REVIEW_COLUMNS } from '@/lib/server/reviews';
import { readSettings } from '@/lib/server/settings';
import type { ReviewRequest } from '@/lib/panel-types';

export const dynamic = 'force-dynamic';

/** Everything the panel renders, in one round trip. */
export const GET = guarded(async () => {
  const [quotes, reviews, items, settings] = await Promise.all([
    listQuotes(),
    db().prepare(`SELECT ${REVIEW_COLUMNS} FROM review_requests ORDER BY id DESC LIMIT 500`).all<ReviewRequest>(),
    listItems(),
    readSettings(),
  ]);
  afterResponse(keepClockRunning(), 'clock');
  const data: PanelData = { quotes, reviews: reviews.results || [], items, settings };
  return json(data);
});
