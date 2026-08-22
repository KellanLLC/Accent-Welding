import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA } from '@/components/page/Page';
import { business } from '@/config/business';
import { boxPrices, leadTimeWeeks, money } from '@/config/pricing';
import f from './faq.module.css';

export const metadata: Metadata = {
  title: 'Questions people ask',
  description:
    'Straight answers on what custom metal railing, fencing, gates and garden boxes cost in Utah County, how long they take, powder coat versus paint, code heights, and who you are talking to at Accent Welding.',
  alternates: { canonical: '/faq' },
};

type QA = { q: string; a: React.ReactNode; plain: string };

export default function FAQ() {
  const cheapest = money(boxPrices['2x1'][12][0]);
  const dearest = money(boxPrices['8x4'][24][1]);

  const qas: QA[] = [
    {
      q: 'What does a railing, a fence or a gate cost?',
      a: (
        <>
          It depends on the length, the height and the style, which is why this site has a{' '}
          <Link href="/build">builder</Link> for each one. Put in your dimensions and you get
          an estimated range and a scale drawing straight away; the firm number comes from a
          free site visit, before any steel is cut. Garden boxes are the exception: those are
          exact, published prices.
        </>
      ),
      plain:
        'It depends on the length, the height and the style, which is why the site has a builder for each one. Put in your dimensions and you get an estimated range and a scale drawing straight away; the firm number comes from a free site visit, before any steel is cut. Garden boxes are exact, published prices.',
    },
    {
      q: 'Are the garden box prices real?',
      a: (
        <>
          Yes. All fifteen sizes are on the <Link href="/garden-boxes">garden box page</Link>{' '}
          exactly as printed on the shop&rsquo;s price list, from {cheapest} for a 2 ft × 1 ft
          × 12 in box in bare steel to {dearest} for 8 ft × 4 ft × 24 in powder coated. Other
          sizes and colours are quoted on request.
        </>
      ),
      plain: `Yes. All fifteen sizes are on the garden box page exactly as printed on the shop's price list, from ${cheapest} for a 2 ft by 1 ft by 12 in box in bare steel to ${dearest} for 8 ft by 4 ft by 24 in powder coated. Other sizes and colours are quoted on request.`,
    },
    {
      q: 'How long does it take?',
      a: (
        <>
          Typically {leadTimeWeeks.gardenBox[0]}–{leadTimeWeeks.gardenBox[1]} weeks for garden
          boxes, {leadTimeWeeks.railing[0]}–{leadTimeWeeks.railing[1]} for railing and gates,
          and {leadTimeWeeks.fence[0]}–{leadTimeWeeks.fence[1]} for a fence, from the day the
          job is confirmed. Everything is fabricated in the shop first and set on site, so the
          install itself is usually a day.
        </>
      ),
      plain: `Typically ${leadTimeWeeks.gardenBox[0]} to ${leadTimeWeeks.gardenBox[1]} weeks for garden boxes, ${leadTimeWeeks.railing[0]} to ${leadTimeWeeks.railing[1]} for railing and gates, and ${leadTimeWeeks.fence[0]} to ${leadTimeWeeks.fence[1]} for a fence, from the day the job is confirmed. Everything is fabricated in the shop first and set on site, so the install itself is usually a day.`,
    },
    {
      q: 'Are estimates and site visits free?',
      a: <>Yes, both. Call or text, or send a spec from a builder, and one of the owners comes out to measure, check the grade and set the post line. No obligation.</>,
      plain: 'Yes, both. Call or text, or send a spec from a builder, and one of the owners comes out to measure, check the grade and set the post line. No obligation.',
    },
    {
      q: 'Where do you work?',
      a: (
        <>
          {business.serviceArea}: from Santaquin, Payson and Spanish Fork up to Provo, Orem,
          Lehi and the far side of the lake, and over the line to Nephi. The{' '}
          <Link href="/service-area">service area page</Link> lists every town with how far it
          is from the shop. Not on it? Ask anyway.
        </>
      ),
      plain: `${business.serviceArea}: from Santaquin, Payson and Spanish Fork up to Provo, Orem, Lehi and the far side of the lake, and over the line to Nephi. The service area page lists every town with how far it is from the shop. Not on it? Ask anyway.`,
    },
    {
      q: 'Who am I talking to?',
      a: (
        <>
          Kelly and Braxton Staheli, father and son, who own the shop fifty-fifty. Kelly is on{' '}
          {business.phone} and Braxton is on {business.phoneAlt}. There is no call centre and
          no sales team; the person who quotes the job is usually the one who welds it.
        </>
      ),
      plain: `Kelly and Braxton Staheli, father and son, who own the shop fifty-fifty. Kelly is on ${business.phone} and Braxton is on ${business.phoneAlt}. There is no call centre and no sales team; the person who quotes the job is usually the one who welds it.`,
    },
    {
      q: 'Powder coat or paint?',
      a: <>Powder coat. It is baked on, so it does not chip or peel the way paint does, and it holds its colour through Utah summers. White, black and bronze are standard; any colour is available on request. Bare steel is the other option, and it weathers to a rust patina on purpose.</>,
      plain: 'Powder coat. It is baked on, so it does not chip or peel the way paint does, and it holds its colour through Utah summers. White, black and bronze are standard; any colour is available on request. Bare steel is the other option, and it weathers to a rust patina on purpose.',
    },
    {
      q: 'What is a wood-look metal privacy fence?',
      a: (
        <>
          Steel panels with a wood-grain powder coat: the look of cedar or barnwood, with nothing
          to warp, rot or grey. Eight grains are offered, from Rough Sawn Distressed Cedar to
          Chippy White, all on the <Link href="/fencing">fencing page</Link>. It is the answer
          for anywhere the wind takes a wood fence apart.
        </>
      ),
      plain: 'Steel panels with a wood-grain powder coat: the look of cedar or barnwood, with nothing to warp, rot or grey. Eight grains are offered, from Rough Sawn Distressed Cedar to Chippy White. It is the answer for anywhere the wind takes a wood fence apart.',
    },
    {
      q: 'Will the railing meet code?',
      a: (
        <>
          It is built to. The <Link href="/build/railing">railing builder</Link> offers 34, 36,
          38 and 42 inch heights with a note on where each applies, and pickets are drawn and
          built at the 4 inch maximum spacing. If your city or inspector has a specific
          requirement, tell us and it is built to that.
        </>
      ),
      plain: 'It is built to. The railing builder offers 34, 36, 38 and 42 inch heights with a note on where each applies, and pickets are built at the 4 inch maximum spacing. If your city or inspector has a specific requirement, tell us and it is built to that.',
    },
    {
      q: 'Can you match a gate to a fence I already have?',
      a: <>Yes. Walk gates and single or double drive gates are built to match the fence they hang in, on posts sized to carry them, with drop rods, cane bolts, self-closing hinges or a lockable latch as needed. Send a photo of the existing fence and the opening width.</>,
      plain: 'Yes. Walk gates and single or double drive gates are built to match the fence they hang in, on posts sized to carry them, with drop rods, cane bolts, self-closing hinges or a lockable latch as needed. Send a photo of the existing fence and the opening width.',
    },
    {
      q: 'Do I need a permit or HOA approval?',
      a: <>Sometimes, and it is yours to check with your city or HOA. What the shop can do is build exactly to the spec they give you and hand you a scale drawing to show them, which is what the builders on this site produce.</>,
      plain: 'Sometimes, and it is yours to check with your city or HOA. What the shop can do is build exactly to the spec they give you and hand you a scale drawing to show them, which is what the builders on this site produce.',
    },
    {
      q: 'Do you do one-off custom work?',
      a: (
        <>
          Yes: brackets, stands, frames, guards, repairs, the thing nobody else will quote. See{' '}
          <Link href="/fabrication">custom fabrication</Link>. Pieces that are already built and
          for sale are listed at <Link href="/custom">Custom &amp; Other</Link> as they come off
          the bench.
        </>
      ),
      plain: 'Yes: brackets, stands, frames, guards, repairs, the thing nobody else will quote. See the custom fabrication page. Pieces that are already built and for sale are listed under Custom & Other as they come off the bench.',
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.plain },
    })),
  };

  return (
    <>
      <section className={f.head}>
        <div className="wrap">
          <div className={f.headGrid}>
            <h1 className="d1">
              Straight <em className={f.em}>answers</em>.
            </h1>
            <p className={f.lede}>
              The things people ask before they call. If yours is not here, the phone works:{' '}
              {business.phone}.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <dl className={f.list}>
          {qas.map((x, i) => (
            <div key={x.q} className={f.item}>
              <dt className={f.q}>
                <span className={f.no}>{String(i + 1).padStart(2, '0')}</span>
                <span>{x.q}</span>
              </dt>
              <dd className={f.a}>{x.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CTA
        title={
          <>
            Still a question? <em>Ask it.</em>
          </>
        }
        copy="Call or text, or write it down on the contact page. One of the owners answers, and an estimate is free either way."
        href="/contact#form"
        label="Write it down"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
