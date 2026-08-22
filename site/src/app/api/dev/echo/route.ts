import { json } from '@/lib/server/http';

/**
 * A stand-in for the GoHighLevel webhook during local development, so the
 * "sent" paths can be exercised without texting anyone. ../.dev.vars points
 * GHL_WEBHOOK_URL here. Answers 404 in production.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return json({ error: 'Not found.' }, 404);
  const body = await req.text().catch(() => '');
  console.log('[dev echo] would send:', body.slice(0, 600));
  return json({ ok: true, echoed: true });
}
