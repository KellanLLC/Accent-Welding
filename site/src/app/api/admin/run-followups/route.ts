import { guarded } from '@/lib/server/auth';
import { runFollowups } from '@/lib/server/followups';
import { json } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

/** Force the follow-up sweep now instead of waiting for traffic to trigger it. */
export const POST = guarded(async () => json({ ok: true, ...(await runFollowups()) }));
