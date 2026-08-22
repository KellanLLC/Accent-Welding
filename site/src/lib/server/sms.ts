import { env } from './env';

/**
 * Hands one message to GoHighLevel. The payload is exactly the three fields
 * the workflow maps: phone, sms-message, company. The webhook URL is a secret
 * and is only ever called from here, so it never appears in anything a
 * browser can read.
 */
export async function sendSms(phoneE164: string, message: string): Promise<string> {
  const { GHL_WEBHOOK_URL, COMPANY_NAME } = env();
  if (!GHL_WEBHOOK_URL) throw new Error('GHL_WEBHOOK_URL secret is not set.');

  let res: Response;
  try {
    res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        phone: phoneE164,
        'sms-message': message,
        company: COMPANY_NAME || 'Accent Welding',
      }),
    });
  } catch {
    // A transport failure surfaces as an opaque internal reference that means
    // nothing to whoever is looking at the panel. Say what to do instead.
    throw new Error('Could not reach GoHighLevel. Check the webhook URL, then try again.');
  }

  const body = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`GoHighLevel returned ${res.status}. ${body.slice(0, 300)}`);
  return body.slice(0, 300);
}
