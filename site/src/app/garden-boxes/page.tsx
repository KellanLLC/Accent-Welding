import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA, Gallery, Lead, Opener, Specs } from '@/components/page/Page';
import { GardenBoxDrawing } from '@/drawings/GardenBoxDrawing';
import { standardColors } from '@/config/products';
import { boxFootprints, boxHeights, boxPrices, money } from '@/config/pricing';
import g from './boxes.module.css';

export const metadata: Metadata = {
  title: 'Steel garden boxes',
  description:
    'Welded steel raised garden beds in fifteen sizes, bare steel or powder coated white, black or bronze. Published prices from $420. Serving Utah County.',
};

const bronze = standardColors.find((c) => c.id === 'bronze')!;

export default function GardenBoxes() {
  return (
    <>
      <Opener
        title={
          <>
            Raised beds that <em>outlast</em> the timber ones.
          </>
        }
        lede="Welded steel, not screwed-together boards. Bare steel weathers to a rust patina and keeps going. Powder coated, it holds its colour for as long as you want it to."
        photo="/img/gardenbox-shop.jpg"
        alt="A large steel garden box mid-fabrication on the welding table in the shop"
        position="50% 46%"
        action={
          <Link href="/build/garden-box" className="btn">
            Build &amp; price a box
          </Link>
        }
      />

      <section className="section">
        <div className="wrap">
          <Lead
            title="Fifteen sizes, and the price for every one of them is on this page."
            copy="This is the shop's own published price list, transcribed exactly. Bare steel on the left, powder coated on the right. Any other colour is priced on request."
          />

          <div className={`scrollX ${g.tableWrap}`}>
            <table className={g.table}>
              <caption className="sr">
                Garden box prices by size and finish
              </caption>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Depth</th>
                  <th scope="col" className={g.num}>
                    Bare steel
                  </th>
                  <th scope="col" className={g.num}>
                    Powder coated
                  </th>
                </tr>
              </thead>
              <tbody>
                {boxFootprints.map((f) =>
                  boxHeights.map((h, hi) => {
                    const [bare, powder] = boxPrices[f.id][h];
                    return (
                      <tr key={`${f.id}-${h}`} className={hi === 0 ? g.groupStart : undefined}>
                        <th scope="row" className={g.sizeCell}>
                          {hi === 0 ? f.label : ''}
                        </th>
                        <td>{h} in</td>
                        <td className={g.num}>{money(bare)}</td>
                        <td className={g.num}>{money(powder)}</td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
          <p className={g.tableNote}>
            Call for a quote on installation or customised sizes. Colours: white, black or
            bronze. Other colours priced on request.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={g.split}>
            <div className={g.splitDraw}>
              <GardenBoxDrawing
                lengthFt={8}
                widthFt={4}
                heightIn={24}
                color={bronze.hex}
                edge={bronze.edge}
                label="bronze powder coat"
              />
            </div>
            <div>
              <h2 className={`d3 ${g.splitTitle}`}>How they are put together</h2>
              <Specs
                items={[
                  { key: 'Corners', val: 'Angle stiffeners', note: 'A vertical angle welded into every corner, so a full bed of wet soil cannot bow the sides.' },
                  { key: 'Top edge', val: 'Folded rim', note: 'The top is folded over, so there is no raw sheet edge to catch a hand or a hose.' },
                  { key: 'Base', val: 'Stands off the ground', note: 'A base rail lifts the box clear so the bottom edge is not sitting in wet soil.' },
                  { key: 'Open bottom', val: 'Drains and roots through', note: 'Set it on soil and deep roots go straight down into the ground beneath.' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Gallery
            items={[
              {
                src: '/img/gardenbox-street.jpg',
                alt: 'A finished bare-steel garden box on a sidewalk with the price sheet taped to the side',
                cap: 'A finished bare-steel box outside the shop, price sheet still taped to the side.',
                wide: true,
              },
              {
                src: '/img/gardenbox-shop.jpg',
                alt: 'A large garden box part-built on the welding table in the shop',
                cap: 'The same size on the table, part way through.',
                wide: true,
              },
            ]}
          />
        </div>
      </section>

      <CTA
        title={
          <>
            Pick a size and <em>see the exact price</em>.
          </>
        }
        copy="The builder quotes the published price for the size and finish you choose, and works out how much soil it takes to fill."
        href="/build/garden-box"
        label="Build & price a box"
      />
    </>
  );
}
