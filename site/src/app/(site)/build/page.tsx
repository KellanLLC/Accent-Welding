import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Arrow';
import { GardenBoxDrawing } from '@/drawings/GardenBoxDrawing';
import { RailingDrawing } from '@/drawings/RailingDrawing';
import { FenceDrawing } from '@/drawings/FenceDrawing';
import { GateDrawing } from '@/drawings/GateDrawing';
import { standardColors } from '@/config/products';
import { boxPrices, money } from '@/config/pricing';
import { business } from '@/config/business';
import s from './Hub.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/build' },
  title: 'Build & price your job',
  description:
    'Configure railing, fencing, gates or a garden box to your own dimensions, watch it drawn to scale, and get a price before anyone comes out.',
};

const bronze = standardColors.find((c) => c.id === 'bronze')!;
const black = standardColors.find((c) => c.id === 'black')!;
const white = standardColors.find((c) => c.id === 'white')!;

export default function BuildHub() {
  return (
    <>
      <div className={`wrap ${s.head}`}>
        <h1 className="d1">
          Price it before anyone <em>comes out</em>.
        </h1>
        <p className={s.blurb}>
          Set the dimensions, pick the style, watch it drawn to scale as you go. Send the
          drawing to the shop when it looks right. No sales call to get a number.
        </p>
      </div>

      <div className={`wrap ${s.grid}`}>
        <Link href="/build/garden-box" className={`plate ${s.card}`}>
          <div className={`plateInner ${s.cardInner}`}>
            <div className={s.preview}>
              <GardenBoxDrawing
                lengthFt={8}
                widthFt={4}
                heightIn={18}
                color={bronze.hex}
                edge={bronze.edge}
                label="bronze"
                showDims={false}
              />
            </div>
            <div className={s.body}>
              <h2 className={s.name}>
                Garden box <Arrow />
              </h2>
              <p className={s.note}>
                Fifteen sizes, bare steel or powder coated. Welded, not bolted.
              </p>
              <p className={`${s.priced} ${s.pricedReal}`}>
                Exact published price · from {money(boxPrices['2x1'][12][0])}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/build/railing" className={`plate ${s.card}`}>
          <div className={`plateInner ${s.cardInner}`}>
            <div className={s.preview}>
              <RailingDrawing
                style="customPicket"
                picket="basket"
                heightIn={36}
                color={black.hex}
                mount="coreDrill"
                raked={false}
              />
            </div>
            <div className={s.body}>
              <h2 className={s.name}>
                Railing <Arrow />
              </h2>
              <p className={s.note}>
                Five build styles and seven picket patterns, from plain square to a full
                basket and cage.
              </p>
              <p className={s.priced}>Estimated range · confirmed on site</p>
            </div>
          </div>
        </Link>

        <Link href="/build/fence" className={`plate ${s.card}`}>
          <div className={`plateInner ${s.cardInner}`}>
            <div className={s.preview}>
              <FenceDrawing
                type="privacy"
                heightFt={6}
                color={black.hex}
                edge={black.edge}
                woodGrain="roughSawnCedar"
                terrain="flat"
              />
            </div>
            <div className={s.body}>
              <h2 className={s.name}>
                Fence <Arrow />
              </h2>
              <p className={s.note}>
                Wood-look privacy, horizontal slat, ranch, continuous pipe or ornamental
                iron. Eight wood-grain finishes.
              </p>
              <p className={s.priced}>Estimated range · confirmed on site</p>
            </div>
          </div>
        </Link>

        <Link href="/build/gate" className={`plate ${s.card}`}>
          <div className={`plateInner ${s.cardInner}`}>
            <div className={s.preview}>
              <GateDrawing
                use="double"
                widthFt={12}
                heightFt={6}
                style="ornamental"
                color={white.hex}
                hardware={['dropRod', 'latchLockable']}
              />
            </div>
            <div className={s.body}>
              <h2 className={s.name}>
                Gate <Arrow />
              </h2>
              <p className={s.note}>
                Walk gate or a double drive gate, built to match the fence it hangs in.
              </p>
              <p className={s.priced}>Estimated range · confirmed on site</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="wrap">
        <div className={`plate ${s.aside}`}>
          <div className={`plateInner ${s.asideInner}`}>
            <div className={s.asideText}>
              <h2>Building something that is not on this list?</h2>
              <p>
                Plasma-cut brackets, dirt bike stands, a repair, a one-off. Send a photo or a
                sketch and we will tell you if we can make it and what it takes.
              </p>
            </div>
            <a href={business.phoneHref} className="btn">
              Call {business.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
