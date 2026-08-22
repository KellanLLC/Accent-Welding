import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA, Gallery, Lead, Opener, Specs, StyleCard, page as s } from '@/components/page/Page';
import { FenceDrawing } from '@/drawings/FenceDrawing';
import { fenceTypes, standardColors, woodGrains, type FenceTypeId } from '@/config/products';

export const metadata: Metadata = {
  title: 'Custom metal fencing',
  description:
    'Metal privacy fencing with a wood-grain finish, horizontal slat, ranch and pasture, continuous pipe and ornamental iron. No warping, no rot. Serving Utah County.',
};

const black = standardColors.find((c) => c.id === 'black')!;
const bronze = standardColors.find((c) => c.id === 'bronze')!;

const drawingFor = (id: FenceTypeId, h: number) => (
  <FenceDrawing
    type={id}
    heightFt={h}
    color={id === 'ornamental' ? bronze.hex : black.hex}
    edge={id === 'ornamental' ? bronze.edge : black.edge}
    woodGrain={id === 'privacy' ? 'roughSawnCedar' : undefined}
    terrain="flat"
  />
);

export default function Fencing() {
  return (
    <>
      <Opener
        title={
          <>
            No warping, no rot, just <em>strength in steel</em>.
          </>
        }
        lede="Upgrade your property with custom metal fencing built to last. From modern privacy fences to durable ranch and pasture fencing, we build solutions that look great and stand up to the elements."
        photo="/img/fence-ranch-road.jpg"
        alt="A long black ranch fence running the length of a property beside a road"
        position="50% 52%"
        action={
          <Link href="/build/fence" className="btn">
            Build &amp; price a fence
          </Link>
        }
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title={
              <>
                Five kinds of fence, and all of them <em>outlive timber</em>.
              </>
            }
            copy="Drawn here at the height each one is usually built. Change the type, the height or the ground it runs over in the builder and the drawing follows."
          />
          <div className={s.styles}>
            {fenceTypes.map((t) => (
              <StyleCard
                key={t.id}
                name={t.name}
                spec={t.spec}
                copy={t.blurb}
                drawing={drawingFor(t.id, t.heights[t.heights.length - 1])}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Get the beautiful look of wood, that will last forever without any maintenance."
            copy="Eight wood-grain powder coat finishes, baked onto steel panels. They do not warp, they do not rot and they never need staining. Pick one in the builder and the drawing changes with it."
          />
          <div className={s.grains}>
            {woodGrains.map((g) => (
              <div key={g.id} className={s.grain}>
                <div className={s.grainChip} style={{ background: g.hex }}>
                  <svg
                    viewBox="0 0 160 92"
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    aria-hidden="true"
                  >
                    {[9, 22, 34, 46, 58, 70, 83].map((y, i) => (
                      <path
                        key={y}
                        d={`M-6 ${y} Q42 ${y - 3.4 - (i % 3) * 1.8} 84 ${y + 1.4} T166 ${y - 1.6}`}
                        fill="none"
                        stroke={g.grain}
                        strokeWidth={i % 2 ? 1.3 : 2.1}
                        opacity={0.7}
                      />
                    ))}
                  </svg>
                </div>
                <span className={s.grainName}>{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Specs
            items={[
              { key: 'Posts', val: 'Set in concrete', note: 'Every post is dug and set. Nothing is driven and hoped for.' },
              { key: 'Sloped ground', val: 'Racked or stepped', note: 'Panels either follow the grade or step down it. Your call, or ours if you would rather.' },
              { key: 'Gates', val: 'Built to match', note: 'A gate in the run is fabricated from the same panel, so it reads as part of the fence.' },
              { key: 'Finish', val: 'Powder coat', note: 'Baked on, so it will not chip or peel. Eight wood grains, or a plain colour.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Ornamental iron, set between cut stone columns."
            copy="Spear finials as standard, on a tube frame, sitting on a stone knee wall. Powder coated bronze."
          />
          <Gallery
            items={[
              {
                src: '/img/ornamental-foothills.jpg',
                alt: 'Bronze ornamental iron fence running toward the Utah foothills',
                cap: 'The run heading toward the foothills, bronze powder coat on a stone knee wall.',
              },
              {
                src: '/img/ornamental-stone-columns.jpg',
                alt: 'Bronze ornamental iron fence with spear finials between cut stone columns at a custom home',
                cap: 'Spear finials between cut stone columns at the front of the house.',
              },
              {
                src: '/img/poster-reel-3-tomorrow-fun-begins.jpg',
                alt: 'A black ranch fence line running along a dirt track with the mountains behind',
                cap: 'Ranch fence, powder coated black. Their own caption: tomorrow the fun part begins.',
              },
            ]}
          />
        </div>
      </section>

      <CTA
        title={
          <>
            Measure the run. <em>See the number.</em>
          </>
        }
        copy="Set the type, the height, the length and the ground it crosses. You get an estimate and a scale drawing before anyone drives out."
        href="/build/fence"
        label="Build & price a fence"
      />
    </>
  );
}
