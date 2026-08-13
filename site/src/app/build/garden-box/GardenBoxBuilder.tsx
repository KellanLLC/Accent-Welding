'use client';

import { useMemo, useState } from 'react';
import { GardenBoxDrawing } from '@/drawings/GardenBoxDrawing';
import { BuilderHead, BuilderLayout, Group, PriceCard, Sheet, type LineItem } from '@/components/builder/Builder';
import { QuoteDialog, type SpecRow } from '@/components/builder/QuoteDialog';
import { Field, OptionGrid, Segmented, Stepper, Swatches } from '@/components/controls';
import { bareSteel, standardColors, type StandardColorId } from '@/config/products';
import {
  boxFootprints,
  boxHeights,
  boxPrices,
  leadTimeWeeks,
  money,
  type BoxFootprint,
  type BoxHeight,
} from '@/config/pricing';

type Finish = 'bare' | 'powder';
type ColorChoice = StandardColorId | 'other';

export function GardenBoxBuilder() {
  const [footprint, setFootprint] = useState<BoxFootprint>('8x4');
  const [height, setHeight] = useState<BoxHeight>(18);
  const [finish, setFinish] = useState<Finish>('powder');
  const [color, setColor] = useState<ColorChoice>('bronze');
  const [qty, setQty] = useState(1);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const fp = boxFootprints.find((f) => f.id === footprint)!;
  const [barePrice, powderPrice] = boxPrices[footprint][height];
  const custom = finish === 'powder' && color === 'other';
  const unit = finish === 'bare' ? barePrice : powderPrice;
  const total = unit * qty;

  const swatch =
    finish === 'bare'
      ? bareSteel
      : color === 'other'
        ? { hex: '#7d7468', edge: '#544d45' }
        : standardColors.find((c) => c.id === color)!;

  const finishName =
    finish === 'bare'
      ? 'Bare steel'
      : color === 'other'
        ? 'Powder coated, colour of your choice'
        : `Powder coated ${standardColors.find((c) => c.id === color)!.name.toLowerCase()}`;

  // Real, useful arithmetic: how much soil this actually takes.
  const soil = useMemo(() => {
    const cuFt = fp.lengthFt * fp.widthFt * ((height - 2) / 12); // filled to 2″ below the rim
    return {
      cuFt: Math.round(cuFt * 10) / 10 * qty,
      cuYd: Math.round((cuFt / 27) * qty * 100) / 100,
      bags: Math.ceil((cuFt / 1.5) * qty),
    };
  }, [fp, height, qty]);

  const items: LineItem[] = [
    {
      label: `${fp.label} × ${height}″ box`,
      sub: finish === 'bare' ? 'Bare steel' : 'Powder coated',
      value: money(unit),
    },
    ...(qty > 1 ? [{ label: 'Quantity', value: `× ${qty}` }] : []),
    ...(finish === 'bare'
      ? [
          {
            label: 'Powder coat instead',
            sub: 'Adds a hard, colour-fast finish',
            value: `+ ${money(powderPrice - barePrice)}`,
            muted: true,
          } as LineItem,
        ]
      : []),
    {
      label: 'Soil to fill it',
      sub: `about ${soil.cuYd} cu yd, or ${soil.bags} bags`,
      value: 'not included',
      muted: true,
    },
  ];

  const spec: SpecRow[] = [
    { key: 'Size', value: `${fp.label} × ${height} in` },
    { key: 'Finish', value: finishName },
    { key: 'Quantity', value: String(qty) },
    { key: 'Soil to fill', value: `${soil.cuYd} cu yd` },
  ];

  return (
    <>
      <BuilderHead
        title="Build a garden box"
        blurb="Fifteen sizes, welded from steel, bare or powder coated. These are Accent Welding's own published prices. What you see here is what the box costs."
      />

      <BuilderLayout
        rail={
          <>
            <Sheet
              title="Garden box"
              scale="Axonometric"
              block={[
                { key: 'Size', val: `${fp.label} × ${height}″` },
                { key: 'Finish', val: finish === 'bare' ? 'Bare steel' : color === 'other' ? 'Custom colour' : standardColors.find((c) => c.id === color)!.name },
                { key: 'Qty', val: String(qty) },
              ]}
            >
              <GardenBoxDrawing
                lengthFt={fp.lengthFt}
                widthFt={fp.widthFt}
                heightIn={height}
                color={swatch.hex}
                edge={swatch.edge}
                label={finishName}
              />
            </Sheet>

            <PriceCard
              items={items}
              totalLabel={custom ? 'Price, standard colours' : 'Your price'}
              totalSub={qty > 1 ? `${money(unit)} each` : undefined}
              total={total}
              leadWeeks={leadTimeWeeks.gardenBox}
              disclaimer={
                custom ? (
                  <>
                    White, black and bronze are the standard colours at this price. Any other
                    colour is quoted on request. Send the build over and we will price the
                    coating.
                  </>
                ) : (
                  <>
                    Accent Welding&rsquo;s published price for this size and finish. Delivery and
                    installation are quoted separately.
                  </>
                )
              }
              onQuote={() => setQuoteOpen(true)}
              quoteLabel="Order this box"
            />
          </>
        }
      >
        <Group n={1} title="Pick the footprint">
          <OptionGrid
            columns={2}
            value={footprint}
            onChange={setFootprint}
            options={boxFootprints.map((f) => ({
              id: f.id,
              name: f.label,
              note:
                f.id === '8x4'
                  ? 'The full bed. Room for a proper row crop.'
                  : f.id === '4x4'
                    ? 'Square, reachable from every side.'
                    : f.id === '4x2'
                      ? 'Fits along a fence or a path.'
                      : f.id === '4x1'
                        ? 'Narrow. Herbs, greens, a strip bed.'
                        : 'The small one. Patio or doorstep.',
              meta: `from ${money(boxPrices[f.id][12][0])}`,
            }))}
          />
        </Group>

        <Group
          n={2}
          title="How deep"
          note="Deeper beds hold water longer and suit root crops. 12 in is plenty for greens and herbs."
        >
          <Segmented
            value={height}
            onChange={(v) => setHeight(v as BoxHeight)}
            options={boxHeights.map((h) => ({ id: h, label: `${h} in` }))}
          />
        </Group>

        <Group
          n={3}
          title="Finish"
          note="Bare steel will weather to a rust patina and keep going. Powder coat is baked on, so it will not chip like paint, and it holds its colour in Utah sun."
        >
          <Field label="Bare or coated">
            <OptionGrid
              columns={2}
              value={finish}
              onChange={setFinish}
              options={[
                { id: 'bare' as const, name: 'Bare steel', note: 'Weathers to a rust patina', meta: money(barePrice) },
                { id: 'powder' as const, name: 'Powder coated', note: 'Baked-on colour', meta: money(powderPrice) },
              ]}
            />
          </Field>

          {finish === 'powder' && (
            <Field label="Colour" hint="Others priced on request">
              <Swatches
                value={color}
                onChange={setColor}
                options={[
                  ...standardColors.map((c) => ({
                    id: c.id as ColorChoice,
                    name: c.name,
                    render: (
                      <span
                        style={{
                          display: 'block',
                          height: '100%',
                          background: `linear-gradient(160deg, ${c.hex} 0%, ${c.edge} 100%)`,
                        }}
                      />
                    ),
                  })),
                  {
                    id: 'other' as ColorChoice,
                    name: 'Another colour',
                    render: (
                      <span
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          height: '100%',
                          background: 'var(--panel-2)',
                          color: 'var(--fg-3)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        On request
                      </span>
                    ),
                  },
                ]}
              />
            </Field>
          )}
        </Group>

        <Group n={4} title="How many">
          <Stepper value={qty} onChange={setQty} min={1} max={40} label="Quantity" unit={qty === 1 ? 'box' : 'boxes'} />
        </Group>
      </BuilderLayout>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={`Garden box · ${fp.label} × ${height} in`}
        spec={spec}
        priceLabel={custom ? 'Price, standard colours' : 'Price'}
        priceValue={money(total)}
      />
    </>
  );
}
