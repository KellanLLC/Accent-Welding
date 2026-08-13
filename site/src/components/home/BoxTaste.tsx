'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GardenBoxDrawing } from '@/drawings/GardenBoxDrawing';
import { Segmented } from '@/components/controls';
import { Arrow } from '@/components/Arrow';
import { standardColors } from '@/config/products';
import { boxFootprints, boxHeights, boxPrices, money, type BoxFootprint, type BoxHeight } from '@/config/pricing';
import s from './BoxTaste.module.css';

/**
 * A working slice of the builder, on the home page. Real sizes, real published
 * prices, and the drawing grows to the size you pick. Nothing here is a mockup.
 */
export function BoxTaste() {
  const [footprint, setFootprint] = useState<BoxFootprint>('4x2');
  const [height, setHeight] = useState<BoxHeight>(18);

  const fp = boxFootprints.find((f) => f.id === footprint)!;
  const [, powder] = boxPrices[footprint][height];
  const bronze = standardColors.find((c) => c.id === 'bronze')!;

  return (
    <div className={s.root}>
      <div className={s.stage}>
        <GardenBoxDrawing
          lengthFt={fp.lengthFt}
          widthFt={fp.widthFt}
          heightIn={height}
          color={bronze.hex}
          edge={bronze.edge}
          label="bronze powder coat"
        />
      </div>

      <div className={s.panel}>
        <h2 className={`d3 ${s.title}`}>Try it. Change a dimension.</h2>
        <p className={s.copy}>
          The drawing is built from the numbers, so it redraws as you go. This is the
          garden box builder, and these are the shop&rsquo;s own published prices.
        </p>

        <div className={s.control}>
          <span className={s.label}>Footprint</span>
          <Segmented
            name="taste-fp"
            value={footprint}
            onChange={(v) => setFootprint(v as BoxFootprint)}
            options={boxFootprints.map((f) => ({ id: f.id, label: f.label.replace(/ ft/g, '′') }))}
          />
        </div>

        <div className={s.control}>
          <span className={s.label}>Depth</span>
          <Segmented
            name="taste-h"
            value={height}
            onChange={(v) => setHeight(v as BoxHeight)}
            options={boxHeights.map((h) => ({ id: h, label: `${h} in` }))}
          />
        </div>

        <div className={s.priceRow}>
          <span className={s.priceKey}>
            Powder coated
            <span className={s.priceSub}>{fp.label} × {height} in</span>
          </span>
          <span className={s.priceVal}>{money(powder)}</span>
        </div>

        <div className={s.actions}>
          <Link href="/build/garden-box" className="btn">
            Open the full builder
          </Link>
          <Link href="/build" className="linkAction">
            Railings, fences &amp; gates too
            <Arrow />
          </Link>
        </div>
      </div>
    </div>
  );
}
