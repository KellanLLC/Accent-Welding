import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * The Worker's bindings, for route handlers and server components only.
 * Never import this from anything marked 'use client'.
 *
 * `CloudflareEnv` (DB, MEDIA, the secrets) is generated into
 * site/cloudflare-env.d.ts by `npm run cf:typegen` from ../wrangler.jsonc.
 */
export function env(): CloudflareEnv {
  return getCloudflareContext().env;
}

export function db(): D1Database {
  return getCloudflareContext().env.DB;
}

/**
 * Runs work after the response has gone out. A text to the owner, a
 * follow-up sweep: nothing a customer should ever wait on, and nothing whose
 * failure should ever fail their request.
 */
export function afterResponse(work: Promise<unknown>, label: string) {
  const { ctx } = getCloudflareContext();
  ctx.waitUntil(
    work.catch((err) => console.error(`[${label}]`, err instanceof Error ? err.message : err)),
  );
}
