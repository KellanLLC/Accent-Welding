'use client';

import { useMemo, useState } from 'react';
import { RailingDrawing } from '@/drawings/RailingDrawing';
import { BuilderHead, BuilderLayout, Group, PriceCard, Sheet, type LineItem } from '@/components/builder/Builder';
import { QuoteDialog, type SpecRow } from '@/components/builder/QuoteDialog';
import { Field, OptionGrid, Segmented, Slider, Stepper, Swatches } from '@/components/controls';
import {
  bareSteel,
  pickets,
  railingHeightNotes,
  railingHeights,
  railingMounts,
  railingStyles,
  standardColors,
  type PicketId,
  type RailingHeight,
  type RailingMountId,
  type RailingStyleId,
  type StandardColorId,
} from '@/config/products';
import { estimateRange, leadTimeWeeks, money, railingRates, ratesConfirmed } from '@/config/pricing';

type ColorChoice = StandardColorId | 'other';

export function RailingBuilder() {
  const [style, setStyle] = useState<RailingStyleId>('basic');
  const [picket, setPicket] = useState<PicketId>('plainSquare');
  const [height, setHeight] = useState<RailingHeight>(36);
  const [feet, setFeet] = useState(40);
  const [corners, setCorners] = useState(2);
  const [stairs, setStairs] = useState(0);
  const [mount, setMount] = useState<RailingMountId>('coreDrill');
  const [finish, setFinish] = useState<'bare' | 'powder'>('powder');
  const [color, setColor] = useState<ColorChoice>('black');
  const [quoteOpen, setQuoteOpen] = useState(false);

  const styleDef = railingStyles.find((s) => s.id === style)!;
  const picketDef = pickets.find((p) => p.id === picket)!;
  const isDeco = style === 'customPicket';

  const calc = useMemo(() => {
    const base = railingRates.style[style];
    const pick = isDeco ? railingRates.picket[picket] : 0;
    const hMult = railingRates.height[height];
    const mountRate = railingRates.mount[mount];
    const finishRate = railingRates.finish[finish];

    const perFt = (base + pick) * hMult + mountRate + finishRate;
    const run = perFt * feet;
    const stairAdd = stairs * railingRates.rakedSection;
    const cornerAdd = corners * railingRates.corner;
    const raw = run + stairAdd + cornerAdd;
    const mid = Math.max(raw, railingRates.minimumJob);
    return {
      perFt,
      run,
      stairAdd,
      cornerAdd,
      belowMin: raw < railingRates.minimumJob,
      mid,
      range: estimateRange(mid),
    };
  }, [style, picket, height, feet, corners, stairs, mount, finish, isDeco]);

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

  const items: LineItem[] = [
    {
      label: `${styleDef.name}${isDeco ? ` · ${picketDef.name}` : ''}`,
      sub: `${feet} lin ft at ${height}″`,
      value: money(calc.run),
    },
    ...(stairs > 0
      ? [{ label: `${stairs} raked stair ${stairs === 1 ? 'run' : 'runs'}`, sub: 'Cut and fitted to the treads', value: money(calc.stairAdd) }]
      : []),
    ...(corners > 0 ? [{ label: `${corners} ${corners === 1 ? 'corner' : 'corners'}`, value: money(calc.cornerAdd) }] : []),
    {
      label: finish === 'powder' ? 'Powder coat' : 'Bare steel',
      sub: finish === 'powder' ? 'Included in the rate above' : 'Weathers, or paint it yourself later',
      value: finish === 'powder' ? 'included' : 'no charge',
      muted: true,
    },
    ...(calc.belowMin
      ? [{ label: 'Shop minimum applied', sub: 'Small runs still need a full setup', value: money(railingRates.minimumJob), muted: true } as LineItem]
      : []),
  ];

  const spec: SpecRow[] = [
    { key: 'Style', value: styleDef.name },
    ...(isDeco ? [{ key: 'Picket', value: picketDef.name }] : []),
    { key: 'Height', value: `${height} in` },
    { key: 'Total run', value: `${feet} lin ft` },
    { key: 'Corners', value: String(corners) },
    { key: 'Stair runs', value: String(stairs) },
    { key: 'Mounting', value: railingMounts.find((m) => m.id === mount)!.name },
    { key: 'Finish', value: finishName },
  ];

  return (
    <>
      <BuilderHead
        title="Build a railing"
        blurb="Five build styles, seven picket patterns, drawn to scale as you go. Set the run and the height and you get a real estimate before anyone drives out."
      />

      <BuilderLayout
        rail={
          <>
            <Sheet
              title="Railing elevation"
              scale="Typical bay"
              block={[
                { key: 'Style', val: styleDef.name },
                { key: 'Height', val: `${height}″` },
                { key: 'Run', val: `${feet} ft` },
                { key: 'Finish', val: finish === 'bare' ? 'Bare' : color === 'other' ? 'Custom' : standardColors.find((c) => c.id === color)!.name },
              ]}
            >
              <RailingDrawing
                style={style}
                picket={picket}
                heightIn={height}
                color={swatch.hex}
                mount={mount}
                raked={stairs > 0}
              />
            </Sheet>

            <PriceCard
              items={items}
              totalLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
              totalSub={`about ${money(calc.perFt)} per lin ft`}
              range={calc.range}
              leadWeeks={leadTimeWeeks.railing}
              disclaimer={
                <>
                  A range, not a quote. Railing is priced on what the site actually needs:
                  the grade, the concrete, how many pieces have to be fitted on the spot.
                  Kelly or Braxton confirms a firm number on a free site visit.
                </>
              }
              onQuote={() => setQuoteOpen(true)}
            />
          </>
        }
      >
        <Group n={1} title="Build style" note={styleDef.blurb}>
          <OptionGrid
            columns={2}
            value={style}
            onChange={setStyle}
            options={railingStyles.map((s) => ({ id: s.id, name: s.name, note: s.spec }))}
          />
        </Group>

        {isDeco && (
          <Group n={2} title="Picket pattern" note={picketDef.note}>
            <OptionGrid
              columns={3}
              value={picket}
              onChange={setPicket}
              options={pickets.map((p) => ({
                id: p.id,
                name: p.name,
                meta: railingRates.picket[p.id] === 0 ? 'standard' : `+ ${money(railingRates.picket[p.id])}/ft`,
              }))}
            />
          </Group>
        )}

        <Group n={isDeco ? 3 : 2} title="Size the run">
          <Field label="Total length" hint={`${feet} linear feet`}>
            <Slider value={feet} onChange={setFeet} min={6} max={400} step={2} label="Total length" unit="ft" />
          </Field>
          <Field label="Finished height" hint={railingHeightNotes[height]}>
            <Segmented
              value={height}
              onChange={(v) => setHeight(v as RailingHeight)}
              options={railingHeights.map((h) => ({ id: h, label: `${h} in` }))}
            />
          </Field>
          <Field label="Corners" hint="Each corner needs its own post">
            <Stepper value={corners} onChange={setCorners} min={0} max={24} label="Corners" unit={corners === 1 ? 'corner' : 'corners'} />
          </Field>
          <Field label="Stair runs" hint="Raked rails follow the stringer">
            <Stepper value={stairs} onChange={setStairs} min={0} max={12} label="Stair runs" unit={stairs === 1 ? 'run' : 'runs'} />
          </Field>
        </Group>

        <Group
          n={isDeco ? 4 : 3}
          title="How it fixes down"
          note={railingMounts.find((m) => m.id === mount)!.note}
        >
          <OptionGrid
            columns={3}
            value={mount}
            onChange={setMount}
            options={railingMounts.map((m) => ({
              id: m.id,
              name: m.name,
              meta: railingRates.mount[m.id] === 0 ? 'standard' : `+ ${money(railingRates.mount[m.id])}/ft`,
            }))}
          />
        </Group>

        <Group n={isDeco ? 5 : 4} title="Finish">
          <Field label="Bare or coated">
            <OptionGrid
              columns={2}
              value={finish}
              onChange={setFinish}
              options={[
                { id: 'bare' as const, name: 'Bare steel', note: 'Weathers to a rust patina' },
                { id: 'powder' as const, name: 'Powder coated', note: 'Baked on, holds colour', meta: `+ ${money(railingRates.finish.powder)}/ft` },
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
                    render: <span style={{ display: 'block', height: '100%', background: `linear-gradient(160deg, ${c.hex} 0%, ${c.edge} 100%)` }} />,
                  })),
                  {
                    id: 'other' as ColorChoice,
                    name: 'Another colour',
                    render: (
                      <span style={{ display: 'grid', placeItems: 'center', height: '100%', background: 'var(--panel-2)', color: 'var(--fg-3)', fontSize: '0.72rem', fontWeight: 600 }}>
                        On request
                      </span>
                    ),
                  },
                ]}
              />
            </Field>
          )}
        </Group>
      </BuilderLayout>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={`Railing · ${styleDef.name}, ${feet} lin ft`}
        spec={spec}
        priceLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
        priceValue={`${money(calc.range[0])} – ${money(calc.range[1])}`}
      />
    </>
  );
}
