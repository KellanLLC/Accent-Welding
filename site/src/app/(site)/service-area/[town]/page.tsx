import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Arrow } from '@/components/Arrow';
import { CTA, Specs } from '@/components/page/Page';
import { areaBySlug, areas, focusMeta } from '@/config/areas';
import { business } from '@/config/business';
import { SITE_URL } from '@/config/site';
import a from '../area.module.css';

type Props = { params: Promise<{ town: string }> };

export function generateStaticParams() {
  return areas.map((t) => ({ town: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = areaBySlug((await params).town);
  if (!area) return { title: 'Not found' };
  return {
    // Held under 60 characters with the "· Accent Welding" suffix.
    title: `Railing, Fencing & Gates in ${area.name}, UT`,
    description: `Custom metal railing, fencing, gates and garden boxes in ${area.name}, ${area.county}, built in the shop and set on site. Price it online first; the site visit to confirm is free.`,
    alternates: { canonical: `/service-area/${area.slug}` },
  };
}

export default async function TownPage({ params }: Props) {
  const area = areaBySlug((await params).town);
  if (!area) notFound();

  const neighbours = areas
    .filter((t) => t.slug !== area.slug)
    .sort((x, y) => Math.abs(x.minutes - area.minutes) - Math.abs(y.minutes - area.minutes))
    .slice(0, 5);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Custom metal railing, fencing and gates in ${area.name}`,
    serviceType: ['Metal railing', 'Metal fencing', 'Steel gates', 'Steel garden boxes', 'Custom metal fabrication'],
    provider: { '@type': 'LocalBusiness', name: business.name, url: SITE_URL, telephone: business.phone },
    areaServed: { '@type': 'City', name: area.name, containedInPlace: { '@type': 'AdministrativeArea', name: `${area.county}, Utah` } },
    url: `${SITE_URL}/service-area/${area.slug}`,
  };

  return (
    <>
      <section className={a.head}>
        <div className="wrap">
          <Link href="/service-area" className={a.crumb}>
            <span aria-hidden="true">←</span> Everywhere we work
          </Link>
          <div className={a.headGrid}>
            <h1 className="d1">
              Steel, built for <em className={a.em}>{area.name}</em>.
            </h1>
            <p className={a.lede}>
              Custom metal railing, fencing, gates and garden boxes in {area.name},{' '}
              {area.county}. Fabricated in the shop{' '}
              {area.minutes ? `about ${area.minutes} minutes away` : 'at this end of the county'}, set on site, and priced
              here before anyone drives over.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={a.two}>
          <div className={a.prose}>
            <h2>What gets built in {area.name}.</h2>
            {area.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className={a.focus}>
            {area.focus.map((f) => {
              const m = focusMeta[f];
              return (
                <Link key={f} href={m.build || m.href} className={`plate ${a.focusItem}`}>
                  <span className={`plateInner ${a.focusInner}`}>
                    <span className={a.focusName}>{m.name}</span>
                    <span className={a.focusLine}>{m.line}</span>
                    <Arrow />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Specs
            items={[
              {
                key: 'From the shop',
                val: area.minutes ? `About ${area.minutes} minutes` : 'Minutes',
                note: 'Rounded, and it does not change the price. The site visit to confirm is free.',
              },
              { key: 'Finish', val: 'Powder coat or bare', note: 'White, black or bronze as standard, any colour on request, eight wood grains for privacy panels.' },
              { key: 'Price first', val: 'On this site', note: 'The builders quote from your dimensions and draw the job to scale before you call.' },
              { key: 'Call or text', val: business.phone, note: `Or ${business.phoneAlt}. Kelly or Braxton picks up.` },
            ]}
          />
          <p className={a.others}>
            Also serving{' '}
            {neighbours.map((t, i) => (
              <span key={t.slug}>
                <Link href={`/service-area/${t.slug}`}>{t.name}</Link>
                {i < neighbours.length - 1 ? ', ' : ''}
              </span>
            ))}
            , and <Link href="/service-area">the rest of the county</Link>.
          </p>
        </div>
      </section>

      <CTA
        title={
          <>
            Free estimates in {area.name}. <em>Fair pricing.</em>
          </>
        }
        copy="Configure what you are after and send the drawing, or just call. Quality work, built right, built to last."
        href="/build"
        label="Build & price your job"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
