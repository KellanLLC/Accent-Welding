import type { Metadata } from 'next';
import './globals.css';
import { display, body } from './fonts';
import { SITE_URL } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Held under 60 characters so Google doesn't truncate it mid-phrase;
    // "custom metal" carries on in the description and og title.
    default: 'Accent Welding · Railing, Fencing & Gates in Utah County',
    template: '%s · Accent Welding',
  },
  description:
    'A high quality fabrication shop building custom metal railing, fencing, gates and garden boxes across Utah County. Price your own build online. Free estimates.',
  openGraph: {
    type: 'website',
    siteName: 'Accent Welding',
    title: 'Accent Welding · Strength in Steel',
    description:
      'Custom metal railing, fencing, gates and garden boxes. Built right. Built to last. Serving Utah County.',
    // og:image comes from src/app/opengraph-image.png (regenerate with
    // `node og.mjs`) — the file convention outranks anything listed here.
  },
  robots: { index: true, follow: true },
};

/**
 * The bare document: fonts, the design system, nothing else. The public site
 * (nav, footer, schema) is the `(site)` group's layout; /admin and the rating
 * page at /r/<token> have their own, so neither carries the site chrome.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  /*
   * data-scroll-behavior is required in Next 16: without it the global
   * `scroll-behavior: smooth` is no longer neutralised during route changes,
   * so every nav click would visibly scroll the whole page to the top instead
   * of landing there.
   */
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
