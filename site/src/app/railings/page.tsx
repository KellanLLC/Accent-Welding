import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA, Gallery, Lead, Opener, Specs, StyleCard, page as s } from '@/components/page/Page';
import { RailingDrawing } from '@/drawings/RailingDrawing';
import { pickets, railingStyles, standardColors, type RailingStyleId } from '@/config/products';

export const metadata: Metadata = {
  title: 'Custom metal railing',
  description:
    'Custom metal railing in five build styles and seven picket patterns, designed to fit your property, your style and your standards. Serving Utah County.',
};

const black = standardColors.find((c) => c.id === 'black')!;
const white = standardColors.find((c) => c.id === 'white')!;

/** The two cards in the picket-and-stairs row share a panel proportion, so a
    stair drawing — which is naturally close to square — can be given the height
    it needs without leaving the card beside it a different size. */
const PAIRED = 1.25;

const drawingFor = (id: RailingStyleId) => (
  <RailingDrawing
    style={id}
    picket={id === 'customPicket' ? 'basket' : 'plainSquare'}
    heightIn={36}
    color={black.hex}
    mount="coreDrill"
    raked={false}
  />
);

export default function Railings() {
  return (
    <>
      <Opener
        title={
          <>
            Railing that fits <em>your</em> property.
          </>
        }
        lede="Designed to fit your property, your style and your standards. From clean modern looks to fully custom picket designs, every piece is precision-built for strength, safety and appearance."
        photo="/img/railing-horizontal.jpg"
        alt="A modern horizontal-picket steel railing on a low concrete wall"
        position="50% 58%"
        action={
          <Link href="/build/railing" className="btn">
            Build &amp; price a railing
          </Link>
        }
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title={
              <>
                Five ways we build a rail, and one of them is <em>however you like</em>.
              </>
            }
            copy="Each of these is drawn here at 36 in, the standard residential guard height. Change any of it in the builder and the drawing follows."
          />
          <div className={s.styles}>
            {railingStyles.map((st) => (
              <StyleCard
                key={st.id}
                name={st.name}
                spec={st.spec}
                copy={st.blurb}
                drawing={drawingFor(st.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Seven picket patterns, from a plain square bar to a full basket and cage."
            copy="Pick the picket and the rest of the rail stays exactly as you set it. Every one of these is drawn to the same scale so you can compare them honestly."
          />
          <div className={s.styles}>
            <StyleCard
              name="Plain, and everything after it"
              spec={pickets.map((p) => p.name).join(' · ')}
              copy="Plain square, diamond panel, knuckle and collar, scroll, barley twist, basket, and basket inside a cage. Shown here with the basket."
              drawing={
                <RailingDrawing
                  style="customPicket"
                  picket="ornateBasketCage"
                  heightIn={42}
                  color={black.hex}
                  mount="coreDrill"
                  raked={false}
                  aspect={PAIRED}
                />
              }
            />
            <StyleCard
              name="Stairs, raked to the stringer"
              spec="Cut and fitted to the treads"
              copy="A raked run is set out and fitted individually. The rail follows the pitch of the stair rather than stepping down it."
              drawing={
                <RailingDrawing
                  style="basic"
                  picket="plainSquare"
                  heightIn={36}
                  color={white.hex}
                  mount="basePlate"
                  raked
                  aspect={PAIRED}
                />
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Specs
            items={[
              { key: 'Frame', val: '1 × 1½″ tube', note: 'Rectangular tube frame on 2″ posts, welded throughout.' },
              { key: 'Heights', val: '34 to 42 in', note: '36 in is the standard residential guard height. 42 in for commercial.' },
              { key: 'Fixing', val: 'Core-drilled', note: 'Or surface base plates, or bolted to the fascia. Whatever the slab allows.' },
              { key: 'Finish', val: 'Bare or powder', note: 'White, black and bronze as standard. Any other colour on request.' },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Lead
            title="Finished jobs, photographed the day they went in."
            copy="Guard rail around a stairwell and window well, and a run down to a basement entry. Both powder coated white."
          />
          <Gallery
            items={[
              {
                src: '/img/railing-guard-white.jpg',
                alt: 'White powder-coated guard railing around a residential stairwell and window well',
                cap: 'Guard rail to a stairwell and window well, powder coated white.',
              },
              {
                src: '/img/railing-basement-stair.jpg',
                alt: 'White steel stair railing running down to a basement entry beside a barn-wood garage',
                cap: 'Stair rail down to a basement entry, alongside a barn-wood garage.',
              },
              {
                src: '/img/railing-site-wide.jpg',
                alt: 'Wider view of the same railing job with a worker on site',
                cap: 'The same job from the street, mid-install.',
              },
            ]}
          />
        </div>
      </section>

      <CTA
        title={
          <>
            Know your run? <em>Price it now.</em>
          </>
        }
        copy="Set the style, the height and the length and you get an estimate and a scale drawing straight away. No sales call needed to get a number."
        href="/build/railing"
        label="Build & price a railing"
      />
    </>
  );
}
