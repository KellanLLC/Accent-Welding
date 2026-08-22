import { guarded } from '@/lib/server/auth';
import { env } from '@/lib/server/env';
import { json, readJson } from '@/lib/server/http';
import { normalisePhone } from '@/lib/server/phone';
import { sendSms } from '@/lib/server/sms';

export const dynamic = 'force-dynamic';

/**
 * Fires one webhook with obvious placeholder content so the GoHighLevel
 * workflow has an inbound sample to map its fields against.
 */
export const POST = guarded(async (req: Request) => {
  const body = (await readJson<{ phone?: string; message?: string }>(req)) || {};
  const phone = normalisePhone(body.phone);
  if (!phone) return json({ error: 'Enter the number the test should go to.' }, 400);
  const message =
    String(body.message ?? '').trim() ||
    'Mapping test from the Accent Welding panel. Fields: phone, sms-message, company.';
  try {
    const reply = await sendSms(phone, message);
    return json({
      ok: true,
      sent: { phone, 'sms-message': message, company: env().COMPANY_NAME || 'Accent Welding' },
      response: reply,
    });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 502);
  }
});
