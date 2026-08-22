import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA, Specs } from '@/components/page/Page';
import { areas } from '@/config/areas';
import { business } from '@/config/business';
import a from './area.module.css';

export const metadata: Metadata = {
  title: 'Service area: Utah County and surrounding',
  description:
    'Accent Welding builds custom metal railing, fencing, gates and garden boxes across Utah County, from Santaquin and Payson to Provo, Orem, Lehi and Saratoga Springs, plus Nephi. Free site visits everywhere on the list.',
  alternates: { canonical: '/service-area' },
};

const groups = [
  { title: 'The south end, where the shop is', test: (m: number) => m <= 15 },
  { title: 'Up the valley', test: (m: number) => m > 15 && m <= 30 },
  { title: 'North county and the far side of the lake', test: (m: number) => m > 30 },
];

export default function ServiceArea() {
  const utah = areas.filter((x) => x.county === 'Utah County');
  const juab = areas.filter((x) => x.county !== 'Utah County');
  return (
    <>
      <section className={a.head}>
        <div className="wrap">
          <div className={a.headGrid}>
            <h1 className="d1">
              Where we <em className={a.em}>work</em>.
            </h1>
            <p className={a.lede}>
              {business.serviceArea}, from a shop at the south end of the county. Every town
              below gets the same prices and the same free site visit; the only thing that
              changes is how long the drive is.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <div className={a.groups}>
          {groups.map((g) => {
            const list = utah.filter((x) => g.test(x.minutes));
            if (!list.length) return null;
            return (
              <div key={g.title}>
                <h2 className={a.groupTitle}>{g.title}</h2>
                <TownList list={list} />
              </div>
            );
          })}
          <div>
            <h2 className={a.groupTitle}>Over the county line</h2>
            <TownList list={juab} />
          </div>
        </div>
        <p className={a.others}>
          Not on the list? Ask anyway. The shop has driven further for the right job, and an
          estimate costs nothing either way. Call or text {business.phone}, or{' '}
          <Link href="/contact#form">write it down here</Link>.
        </p>
      </section>

      <section className="section">
        <div className="wrap">
          <Specs
            items={[
              { key: 'Site visits', val: 'Free, everywhere listed', note: 'To measure, check the grade and set the post line before anything is cut.' },
              { key: 'Built where', val: 'In the shop, set on site', note: 'Panels and rails are fabricated on the table and installed in a day where the job allows.' },
              { key: 'Price first', val: 'The builders on this site', note: 'Dimensions in, number and scale drawing out, before anyone drives over.' },
              { key: 'Call or text', val: business.phone, note: `Or ${business.phoneAlt}. One of the two owners picks up.` },
            ]}
          />
        </div>
      </section>

      <CTA
        title={
          <>
            Price it first, then <em>we will come out</em>.
          </>
        }
        copy="Configure the job and send the drawing. The site visit to confirm it is free, wherever on this list you are."
        href="/build"
        label="Build & price your job"
      />
    </>
  );
}

function TownList({ list }: { list: typeof areas }) {
  return (
    <ul className={a.towns}>
      {list.map((t) => (
        <li key={t.slug}>
          <Link href={`/service-area/${t.slug}`} className={`plate ${a.town}`}>
            <span className={`plateInner ${a.townInner}`}>
              <span className={a.townName}>{t.name}</span>
              <span className={a.townMin}>{t.minutes ? `~${t.minutes} min` : 'the shop'}</span>
              <span className={a.townLine}>{t.line}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
