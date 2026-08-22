import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { CTA, Lead, Opener, Specs } from '@/components/page/Page';
import { ReelWall } from '@/components/ReelWall';

export const metadata: Metadata = {
  title: 'Custom fabrication',
  description:
    'MIG welding and plasma cutting for one-off steel work, brackets, stands and repairs. If it is steel and you can describe it, send it over. Serving Utah County.',
};

export default function Fabrication() {
  return (
    <>
      <Opener
        title={
          <>
            Send us the thing <em>nobody else</em> will quote.
          </>
        }
        lede="Brackets, stands, frames, repairs, one-offs. If it is steel and you can describe it, sketch it or photograph it, the shop can usually make it."
        photo="/img/fab-plasma-plate.jpg"
        alt="A steel plate on the bench with a shape freshly cut through it by the plasma cutter"
        position="50% 44%"
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title="There is no configurator for this one, because there is no such thing as a standard one-off."
            copy="Everything else on this site can be priced from a set of dimensions. Custom work cannot. Describe it and you get a straight answer about whether it can be made and what it takes."
          />
          <Specs
            items={[
              { key: 'Welding', val: 'Miller 252 MIG', note: 'A Millermatic 252 running in an insulated shop, on a fabricated steel table.' },
              { key: 'Cutting', val: 'Plasma', note: 'Plasma makes quick work of a custom piece, including shapes a saw will never make.' },
              { key: 'Typical work', val: 'Brackets and stands', note: 'Machine brackets, dirt bike stands, frames, guards, and repairs to things that broke.' },
              { key: 'What to send', val: 'A photo or a sketch', note: 'Dimensions if you have them. A photo of the broken part is usually enough to start.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Some of it is already built, and for sale."
            copy="One-off pieces that came off the bench between jobs are listed on the site as they are finished, with photos and a price. First come, first served."
          />
          <Link href="/custom" className="linkAction">
            See what is for sale right now
            <Arrow />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Work in progress, filmed on the bench."
            copy="These are the shop's own clips, posted as the work happened."
          />
          <ReelWall />
        </div>
      </section>

      <CTA
        title={
          <>
            Describe it and <em>we will tell you straight</em>.
          </>
        }
        copy="If it is not something the shop should be making, you will hear that too. Free either way."
        href="/contact#form"
        label="Send it over"
      />
    </>
  );
}
