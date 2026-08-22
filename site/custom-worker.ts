/**
 * The Worker's entry point. OpenNext compiles the Next.js app into
 * .open-next/worker.js at build time; this file re-exports that handler
 * unchanged and adds the one thing the generated file cannot carry: the
 * Durable Object class behind the follow-up clock (src/worker/sweeper.ts).
 * wrangler.jsonc's `main` points here.
 */

// The import resolves only after a build has produced .open-next/worker.js.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from './.open-next/worker.js';

export { Sweeper } from './src/worker/sweeper';

export default {
  fetch: handler.fetch,
} satisfies ExportedHandler<CloudflareEnv>;
