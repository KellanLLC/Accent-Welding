import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Hero } from '@/components/Hero';
import { Arrow } from '@/components/Arrow';
import { ReelWall } from '@/components/ReelWall';
import { BoxTaste } from '@/components/home/BoxTaste';
import { GateDrawing } from '@/drawings/GateDrawing';
import { standardColors } from '@/config/products';
import { business } from '@/config/business';
import s from './page.module.css';

const bronze = standardColors.find((c) => c.id === 'bronze')!;

export default function Home() {
  return (
    <>
      <Hero />

      <section className="section">
        <div className="wrap">
          <div className={s.buildIntro}>
            <h2>
              A high quality fabrication shop, and everything it makes is <em>custom</em>.
            </h2>
            <p>
              Railing, fencing, gates and garden boxes, designed to fit your property, your
              style and your standards. Built for Utah conditions.
            </p>
          </div>

          <div className={s.rowA}>
            <ProductCard
              href="/railings"
              name="Railings"
              spec="Five build styles · seven picket patterns"
              copy="Precision-built for strength, safety and appearance, from clean modern looks to fully custom picket designs."
              size="a"
              media={
                <Image
                  src="/img/railing-horizontal.jpg"
                  alt="A modern horizontal-picket steel railing on a low concrete wall, powder coated dark"
                  width={900}
                  height={700}
                  sizes="(max-width: 900px) 100vw, 640px"
                  quality={78}
                />
              }
            />
            <ProductCard
              href="/fencing"
              name="Fencing"
              spec="Privacy · slat · ranch · pipe · ornamental"
              copy="No warping, no rot, just strength in steel. Including wood-look privacy panels in eight powder-coat grains."
              size="a"
              media={
                <Image
                  src="/img/ornamental-stone-columns.jpg"
                  alt="Bronze ornamental iron fence with spear finials set between cut stone columns at a custom home"
                  width={900}
                  height={700}
                  sizes="(max-width: 900px) 100vw, 640px"
                  quality={78}
                />
              }
            />
          </div>

          <div className={s.rowB}>
            {/*
              There is not one dedicated gate photograph in the whole archive, so
              this card shows the drawing instead of borrowing a fence photo and
              calling it a gate. TODO(kelly): send gate photos and swap this.
            */}
            <ProductCard
              href="/gates"
              name="Gates"
              spec="Walk · single drive · double drive"
              copy="Built to match the fence it hangs in, hung on posts sized to carry it."
              size="b"
              media={
                <div className={s.drawShot}>
                  <GateDrawing
                    use="double"
                    widthFt={12}
                    heightFt={6}
                    style="ornamental"
                    color={bronze.hex}
                    hardware={['dropRod', 'latchLockable']}
                  />
                </div>
              }
            />
            <ProductCard
              href="/garden-boxes"
              name="Garden boxes"
              spec="Fifteen sizes · priced on the site"
              copy="Welded steel beds that will outlast the timber ones. Bare or powder coated."
              size="b"
              media={
                <Image
                  src="/img/gardenbox-street.jpg"
                  alt="A finished bare-steel garden box on a sidewalk with the price sheet taped to the side"
                  width={900}
                  height={700}
                  sizes="(max-width: 900px) 100vw, 420px"
                  quality={78}
                />
              }
            />
            <ProductCard
              href="/fabrication"
              name="Custom fabrication"
              spec="MIG · plasma · one-offs & repairs"
              copy="Brackets, stands, repairs, and the things nobody else will quote."
              size="b"
              media={
                <Image
                  src="/img/fab-plasma-plate.jpg"
                  alt="A steel plate on the bench with a shape freshly cut through it by the plasma cutter"
                  width={900}
                  height={700}
                  sizes="(max-width: 900px) 100vw, 420px"
                  quality={78}
                />
              }
            />
          </div>
        </div>
      </section>

      <section className={`section ${s.priceBand}`}>
        <div className="wrap">
          <BoxTaste />
        </div>
      </section>

      {/* A photographic plate: real atmosphere carried down the page, feathered
          at both edges into the same page colour so there is no seam. */}
      <section className={s.plate}>
        <div className={s.plateImg}>
          <Image
            src="/img/fence-ranch-field.jpg"
            alt="A black ranch fence running across a green field toward the Utah foothills"
            fill
            sizes="100vw"
            quality={82}
          />
        </div>
        <div className={s.plateScrim} />
        <div className={`wrap ${s.plateInner}`}>
          <p className={s.plateLine}>No warping, no rot, just strength in steel.</p>
          <p className={s.plateCap}>
            Post-and-rail ranch fence, powder coated black, on one of the long runs the
            shop filmed through spring 2026.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={s.shopHead}>
            <h2 className="d2">From the shop floor</h2>
            <p>
              Everything below was filmed on a job or on the bench. No stock footage, no
              stand-ins.
            </p>
          </div>
          <ReelWall limit={4} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={s.proof}>
            <div className={`plate ${s.quote}`}>
              <div className={`plateInner ${s.quoteInner}`}>
                <p className={s.quoteText}>
                  A quality fence is one of the best investments you can make in your
                  property. We partnered with Accent Welding on this project to deliver a
                  finished product that&rsquo;s both functional and built to last.
                </p>
                <div className={s.quoteWho}>
                  <span className={s.quoteName}>All Home Services</span>
                  <span className={s.quoteMeta}>
                    Utah general contractor · four shared jobs in 2026 ·{' '}
                    <a
                      href="https://www.instagram.com/all_homeservices/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @all_homeservices
                    </a>
                  </span>
                </div>
              </div>
            </div>

            <div className={s.facts}>
              <div className={s.fact}>
                <span className={s.factNo}>01</span>
                <div>
                  <h3 className={s.factTitle}>Welded, not bolted together</h3>
                  <p className={s.factBody}>
                    Panels are fabricated on a steel table in an insulated shop, then set on
                    site. A welded joint does not work loose the way a fastened one does.
                  </p>
                </div>
              </div>
              <div className={s.fact}>
                <span className={s.factNo}>02</span>
                <div>
                  <h3 className={s.factTitle}>Powder coat, not paint</h3>
                  <p className={s.factBody}>
                    Baked on, so it will not chip or peel, and it holds colour through Utah
                    summers. White, black and bronze as standard, or any colour on request.
                  </p>
                </div>
              </div>
              <div className={s.fact}>
                <span className={s.factNo}>03</span>
                <div>
                  <h3 className={s.factTitle}>You see the price first</h3>
                  <p className={s.factBody}>
                    Configure the job here and you get a real number and a scale drawing
                    before anyone drives out. Estimates are free either way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.close}>
        <div className={s.closePhoto}>
          <Image
            src="/img/welder-corral.jpg"
            alt="A welder perched on a corral fence, arc lit, with the snow-capped Wasatch range behind"
            fill
            sizes="100vw"
            quality={78}
          />
        </div>
        <div className={s.closeScrim} />
        <div className={`wrap ${s.closeInner}`}>
          <div>
            <h2 className={s.closeTitle}>
              Free estimates. <em>Fair pricing.</em>
            </h2>
            <p className={s.closeCopy}>
              Serving {business.serviceArea}. Call or text. Kelly answers the phone
              himself.
            </p>
          </div>
          <div className={s.closeActions}>
            <Link href="/build" className="btn">
              Build &amp; price your job
            </Link>
            <a href={business.phoneHref} className={s.closeCall}>
              or call {business.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({
  href,
  media,
  name,
  spec,
  copy,
  size,
}: {
  href: string;
  media: ReactNode;
  name: string;
  spec: string;
  copy: string;
  size: 'a' | 'b';
}) {
  return (
    <Link href={href} className={`plate ${s.card}`}>
      <div className={`plateInner ${s.cardInner}`}>
        <div className={`${s.shot} ${size === 'a' ? s.shotA : s.shotB}`}>{media}</div>
        <h3 className={s.cardName}>{name}</h3>
        <p className={s.cardSpec}>{spec}</p>
        <p className={s.cardCopy}>{copy}</p>
        <span className={s.cardLink}>
          See what we build <Arrow />
        </span>
      </div>
    </Link>
  );
}
