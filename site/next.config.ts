import type { NextConfig } from 'next';

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
