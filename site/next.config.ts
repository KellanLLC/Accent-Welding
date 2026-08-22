import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/**
 * Gives `next dev` the same bindings the deployed Worker has (the D1 database,
 * the KV namespace for photos, the secrets in ../.dev.vars), served by
 * miniflare from the wrangler config at the repo root. Without this every
 * `getCloudflareContext()` call in dev throws.
 */
initOpenNextCloudflareForDev({
  configPath: '../wrangler.jsonc',
  // Same local state directory `npx wrangler d1 execute --local` writes to
  // when run from the repo root, so one schema apply serves both.
  persist: { path: '../.wrangler/state/v3' },
});

const nextConfig: NextConfig = {
  /* The floating dev badge sits over the bottom-left of every page and gets in
     the way of screenshotting the real composition. Production is unaffected. */
  devIndicators: false,

  images: {
    /**
     * Next 16 narrowed the default to [75] and silently coerces anything else
     * to the nearest allowed value. The hero and the full-bleed bands are large
     * photographs where 75 shows compression in the sky, so the values actually
     * used across the site are declared here.
     */
    qualities: [70, 76, 78, 82],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
