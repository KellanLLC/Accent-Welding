import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA, Lead, Opener, Specs, StyleCard, page as s } from '@/components/page/Page';
import { GateDrawing } from '@/drawings/GateDrawing';
import { gateHardware, standardColors } from '@/config/products';

export const metadata: Metadata = {
  title: 'Steel gates',
  description:
    'Walk gates and single or double drive gates, fabricated to match the fence they hang in and hung on posts sized to carry them. Serving Utah County.',
};

const bronze = standardColors.find((c) => c.id === 'bronze')!;
const black = standardColors.find((c) => c.id === 'black')!;

export default function Gates() {
  return (
    <>
      <Opener
        title={
          <>
            A gate is the part that <em>moves</em>.
          </>
        }
        lede="Which is why it gets the heaviest posts, the deepest footings and the most attention. Built to match the fence it hangs in, so it reads as part of the run rather than a hole in it."
        photo="/img/ornamental-stone-columns.jpg"
        alt="Ornamental iron fencing between stone columns, the style a matching gate is built from"
        position="50% 40%"
        action={
          <Link href="/build/gate" className="btn">
            Build &amp; price a gate
          </Link>
        }
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title={
              <>
                Three gates, and the one you need depends on <em>what goes through it</em>.
              </>
            }
            copy="Drawn to scale at the widths they are usually built. Set your own opening in the builder and the drawing follows it."
          />
          <div className={s.styles}>
            <StyleCard
              name="Walk gate"
              spec="One leaf, 3 to 6 ft"
              copy="Person width. Self-closing hinges and a lockable latch if you want it to shut behind you every time."
              drawing={
                <GateDrawing use="walk" widthFt={4} heightFt={6} style="privacy" color={black.hex} woodGrain="roughSawnCedar" hardware={['latchLockable']} />
              }
            />
            <StyleCard
              name="Single drive gate"
              spec="One leaf, 8 to 16 ft"
              copy="One leaf across a drive. Simpler than a pair, but it needs a serious hinge post to carry the swing."
              drawing={
                <GateDrawing use="single" widthFt={12} heightFt={5} style="pasture" color={black.hex} hardware={['latchLockable']} />
              }
            />
            <StyleCard
              name="Double drive gate"
              spec="Two leaves, 10 to 24 ft"
              copy="Two leaves meeting in the middle, with a drop rod pinning the passive one into the ground."
              drawing={
                <GateDrawing use="double" widthFt={14} heightFt={6} style="ornamental" color={bronze.hex} hardware={['dropRod', 'latchLockable']} />
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="The hardware is the part that decides whether you still like the gate in five years."
            copy="All of it is fitted in the shop and set out on the drawing, so nothing is improvised on site."
          />
          {/* Two banks of the same table, sharing one hairline between them —
              the hardware that is fitted, then the gate it is fitted to. */}
          <Specs
            items={gateHardware.map((h) => ({ key: h.name, val: h.note, note: undefined }))}
          />
          <Specs
            items={[
              { key: 'Posts', val: 'Sized to the leaf', note: 'A 14 ft double gate does not hang on a fence post. Heavier steel, deeper concrete.' },
              { key: 'Frame', val: 'Welded square tube', note: 'Braced on the diagonal so the leaf cannot drop out of square.' },
              { key: 'Infill', val: 'Matches the fence', note: 'Privacy panel, slat, ranch rail, pipe or ornamental picket.' },
              { key: 'Finish', val: 'Bare or powder', note: 'Including the eight wood-grain finishes, so a gate in a wood-look fence disappears into it.' },
            ]}
          />
        </div>
      </section>

      <CTA
        title={
          <>
            Measure the opening. <em>We do the rest.</em>
          </>
        }
        copy="Set the clear width, the height and the style. You get an estimate and a scale elevation showing hinges, latch and drop rod exactly where they will go."
        href="/build/gate"
        label="Build & price a gate"
      />
    </>
  );
}
