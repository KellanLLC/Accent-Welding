import localFont from 'next/font/local';

/**
 * Trench Slab — the display voice. A heavy Tuscan/Clarendon slab with flared,
 * bracketed serifs. Chosen because it echoes the flared slab serifs of the
 * existing ACCENT WELDING wordmark on the business card, without being a
 * costume western face. Self-hosted, not a Google font.
 */
export const display = localFont({
  src: [
    { path: '../fonts/trench-slab-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/trench-slab-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/trench-slab-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

/**
 * Synonym — the quiet body face. A humanist sans with enough warmth to sit
 * under a Clarendon slab, and deliberately not one of the four Fontshare faces
 * that show up on every generated site.
 */
export const body = localFont({
  src: [
    { path: '../fonts/synonym-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/synonym-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/synonym-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/synonym-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
