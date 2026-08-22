import type { Metadata } from 'next';
import Image from 'next/image';
import { CTA, Lead, Opener, Specs } from '@/components/page/Page';
import { business } from '@/config/business';
import a from './about.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Accent Welding is a high quality fabrication shop in Utah County, opened in 2025 and run fifty-fifty by Kelly and Braxton Staheli, father and son. Custom railing, fencing, gates and fabrication.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <>
      <Opener
        title={
          <>
            A shop, a <em>Miller 252</em>, and a rule about doing it properly.
          </>
        }
        lede="Accent Welding is a high quality fabrication shop. Custom fences, railings and gates. Utah based. Built right, built to last."
        photo="/img/welder-corral.jpg"
        alt="A welder perched on a corral fence, arc lit, with the snow-capped Wasatch range behind"
        position="50% 32%"
      />

      <section className="section">
        <div className="wrap">
          <div className={a.two}>
            <div>
              <h2 className={`d3 ${a.h}`}>Opened in 2025, and everything since has been custom.</h2>
              <div className={a.prose}>
                <p>
                  Kelly and Braxton Staheli, father and son, own the shop fifty-fifty and
                  answer the phone themselves. There is no call centre and no sales team,
                  which is the reason this site prices jobs itself: you should be able to
                  find out roughly what something costs without waiting for somebody to get
                  back to you.
                </p>
                <p>
                  Everything is fabricated on a steel table in an insulated shop and set on
                  site, rather than assembled out of a kit. Panels are welded. Posts are dug
                  and set in concrete. Powder coat is baked on rather than painted, so it
                  holds its colour through Utah summers and does not peel.
                </p>
                <p>
                  The shop is young, and it says so. What it has instead of thirty years of
                  history is a full record of everything it has built, published as it
                  happened, with the view counts still attached.
                </p>
              </div>
            </div>

            <div className={a.lockupWrap}>
              <div className={a.cardFrame}>
                <Image
                  src="/img/card-mark.jpg"
                  alt="The Accent Welding business card, the longhorn skull stamped in buckskin on matte black, on the shop bench"
                  fill
                  sizes="(max-width: 880px) 100vw, 520px"
                  quality={82}
                  className={a.cardImg}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Specs
            items={[
              { key: 'Owners', val: business.ownersLine, note: 'Father and son, fifty-fifty. One of them answers the phone, quotes the job, and is usually the one welding it.' },
              { key: 'Established', val: String(business.established), note: 'Trading since 2025, serving Utah County and surrounding areas.' },
              { key: 'Kit', val: 'Millermatic 252', note: 'MIG, plus a plasma cutter, in an insulated shop with a fabricated steel bench.' },
              { key: 'Estimates', val: 'Free', note: 'Call or text. Quality work, fair pricing, built to last.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Contractors we work alongside."
            copy="All Home Services is a Utah general contractor that has shared four fencing jobs with the shop through 2026 and posted every one of them."
          />
          <div className={`plate ${a.quote}`}>
            <div className={`plateInner ${a.quoteInner}`}>
              <p className={a.quoteText}>
                We&rsquo;re excited about this project with Accent Welding, and it&rsquo;s
                already coming along great. Got some content out on-site today and can&rsquo;t
                wait to share more of the process, details, and finished result as everything
                keeps coming together.
              </p>
              <p className={a.quoteWho}>
                <span className={a.quoteName}>All Home Services</span>
                <span className={a.quoteMeta}>
                  posted 19 May 2026 ·{' '}
                  <a href="https://www.instagram.com/all_homeservices/" target="_blank" rel="noopener noreferrer">
                    @all_homeservices
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={a.shopStrip}>
        <Image
          src="/img/railing-site-wide.jpg"
          alt="A white guard railing being set on site, the run already in and a second panel around the window well"
          width={1536}
          height={2048}
          sizes="100vw"
          quality={78}
          className={a.shopImg}
        />
      </section>

      <CTA
        title={
          <>
            Free estimates. <em>Call or text.</em>
          </>
        }
        copy={`Serving ${business.serviceArea}. If you would rather see a number first, the builder will give you one.`}
        href="/contact"
        label="Get in touch"
      />
    </>
  );
}
