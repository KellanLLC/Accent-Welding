import type { Metadata } from 'next';
import './globals.css';
import { display, body } from './fonts';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { business } from '@/config/business';

const SITE = 'https://accentwelding.com'; // TODO(kelly): confirm final domain

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Accent Welding · Custom metal railing, fencing & gates in Utah County',
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
    images: [{ url: '/img/ornamental-foothills-1600.jpg', width: 1200, height: 1600 }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  /**
   * Schema is deliberately a service-area business with no streetAddress: the
   * city behind ZIP 84655 is unconfirmed, and a wrong city in structured data
   * is worse than none. Flip business.addressPublished once it is settled.
   */
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://schema.org/HomeAndConstructionBusiness',
    name: business.name,
    description:
      'Custom metal railing, fencing, gates, garden boxes and fabrication, serving Utah County.',
    url: SITE,
    telephone: business.phone,
    email: business.email,
    founder: { '@type': 'Person', name: business.owner },
    foundingDate: String(business.established),
    slogan: 'Strength in Steel',
    address: {
      '@type': 'PostalAddress',
      ...(business.addressPublished
        ? { streetAddress: business.street, addressLocality: business.city }
        : {}),
      postalCode: business.postalCode,
      addressRegion: business.region,
      addressCountry: business.country,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: business.geo.lat,
        longitude: business.geo.lng,
      },
      geoRadius: business.geo.radiusMeters,
    },
    sameAs: [business.social.facebook, business.social.instagram],
    knowsAbout: [
      'Custom metal railing',
      'Metal privacy fencing',
      'Ranch and pasture fencing',
      'Ornamental iron fencing',
      'Steel gates',
      'Steel garden boxes',
      'Custom metal fabrication',
    ],
  };

  /*
   * data-scroll-behavior is required in Next 16: without it the global
   * `scroll-behavior: smooth` is no longer neutralised during route changes,
   * so every nav click would visibly scroll the whole page to the top instead
   * of landing there.
   */
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </body>
    </html>
  );
}
