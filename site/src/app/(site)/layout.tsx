import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { business } from '@/config/business';
import { SITE_URL } from '@/config/site';

/** The public site: nav, footer, and the LocalBusiness schema on every page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
    url: SITE_URL,
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

  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
