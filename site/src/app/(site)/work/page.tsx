import type { Metadata } from 'next';
import { CTA, Gallery, Lead, Opener } from '@/components/page/Page';
import { ReelWall } from '@/components/ReelWall';

export const metadata: Metadata = {
  alternates: { canonical: '/work' },
  title: 'Work',
  description:
    'Finished railing, fencing and garden box jobs from Accent Welding, photographed on site across Utah County in 2026.',
};

export default function Work() {
  return (
    <>
      <Opener
        title={
          <>
            Everything here was <em>built and photographed</em> this year.
          </>
        }
        lede="The shop opened in 2025. This is all of it, on real jobs, shot on the day. No stock photography and no borrowed work."
        photo="/img/ornamental-foothills.jpg"
        alt="Bronze ornamental iron fence running toward the Utah foothills"
        position="55% 45%"
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title="Ornamental iron between cut stone columns."
            copy="Bronze powder coat, spear finials, on a stone knee wall running the boundary of a custom home in the Utah County foothills."
          />
          <Gallery
            items={[
              { src: '/img/ornamental-foothills.jpg', alt: 'Bronze ornamental iron fence receding toward the foothills', cap: 'The run heading toward the foothills.' },
              { src: '/img/ornamental-stone-columns.jpg', alt: 'Ornamental iron fence with spear finials between cut stone columns', cap: 'Spear finials, between cut stone columns.' },
              { src: '/img/fence-ranch-road.jpg', alt: 'A long black ranch fence beside a road', cap: 'Ranch fence, powder coated black, on one of two long runs.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Guard rail and stair rail, powder coated white."
            copy="A stairwell, a window well and a run down to a basement entry, all on the same residential job."
          />
          <Gallery
            items={[
              { src: '/img/railing-guard-white.jpg', alt: 'White guard railing around a stairwell and window well', cap: 'Guard rail to the stairwell and window well.' },
              { src: '/img/railing-basement-stair.jpg', alt: 'White stair railing down to a basement entry', cap: 'Stair rail to the basement entry.' },
              { src: '/img/railing-site-wide.jpg', alt: 'A wider view of the railing job with a worker on site', cap: 'The same job from the street, mid-install.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Garden boxes, on the table and on the street."
            copy="Bare steel, welded up on the shop table, then out the door."
          />
          <Gallery
            items={[
              { src: '/img/gardenbox-shop.jpg', alt: 'A garden box part-built on the welding table', cap: 'On the table, part way through.', wide: true },
              { src: '/img/gardenbox-street.jpg', alt: 'A finished bare-steel garden box on a sidewalk', cap: 'Finished, with the price sheet still taped to the side.', wide: true },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="All eight clips the shop has posted, in full."
            copy="Filmed on jobs and on the bench through spring and summer 2026, with their own captions and their own view counts."
          />
          <ReelWall />
        </div>
      </section>

      <CTA
        title={
          <>
            Want yours in <em>next year&rsquo;s</em> set?
          </>
        }
        copy="Configure what you are after and send the drawing over. Free estimates, quality work, fair pricing."
        href="/build"
        label="Build & price your job"
      />
    </>
  );
}
