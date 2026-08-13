'use client';

import { useState } from 'react';
import { FenceDrawing } from '@/drawings/FenceDrawing';
import { BuilderHead, BuilderLayout, Group, PriceCard, Sheet, type LineItem } from '@/components/builder/Builder';
import { QuoteDialog, type SpecRow } from '@/components/builder/QuoteDialog';
import { Field, OptionGrid, Segmented, Slider, Stepper, Swatches } from '@/components/controls';
import {
  bareSteel,
  fenceTypes,
  standardColors,
  terrains,
  woodGrains,
  type FenceTypeId,
  type StandardColorId,
  type TerrainId,
  type WoodGrainId,
} from '@/config/products';
import { estimateRange, fenceRates, gateRates, leadTimeWeeks, money, ratesConfirmed } from '@/config/pricing';

type ColorChoice = StandardColorId | 'other';

export function FenceBuilder() {
  const [type, setType] = useState<FenceTypeId>('privacy');
  const [heightFt, setHeightFt] = useState(6);
  const [feet, setFeet] = useState(120);
  const [terrain, setTerrain] = useState<TerrainId>('flat');
  const [grain, setGrain] = useState<WoodGrainId>('roughSawnCedar');
  const [finish, setFinish] = useState<'bare' | 'powder'>('powder');
  const [color, setColor] = useState<ColorChoice>('black');
  const [walkGates, setWalkGates] = useState(1);
  const [driveGates, setDriveGates] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const typeDef = fenceTypes.find((t) => t.id === type)!;
  const usesGrain = typeDef.woodGrain;

  /** Not every height is offered for every type, so derive rather than trust state. */
  const validHeight = typeDef.heights.includes(heightFt)
    ? heightFt
    : typeDef.heights[typeDef.heights.length - 1];

  function pickType(next: FenceTypeId) {
    const d = fenceTypes.find((t) => t.id === next)!;
    setType(next);
    if (!d.heights.includes(heightFt)) setHeightFt(d.heights[d.heights.length - 1]);
  }

  const calc = (() => {
    const base = fenceRates.type[type];
    const hMult = fenceRates.height[validHeight as keyof typeof fenceRates.height] ?? 1;
    const grainAdd = usesGrain ? fenceRates.woodGrainUpcharge : 0;
    const finishAdd = usesGrain ? 0 : fenceRates.finish[finish];
    const perFt = (base * hMult + grainAdd + finishAdd) * fenceRates.terrain[terrain];
    const run = perFt * feet;

    const gateStyleMult = gateRates.style[type];
    const walkEach = gateRates.base.walk * gateStyleMult * (gateRates.height[validHeight as keyof typeof gateRates.height] ?? 1);
    const driveEach = gateRates.base.double * gateStyleMult * (gateRates.height[validHeight as keyof typeof gateRates.height] ?? 1);
    const gates = walkGates * walkEach + driveGates * driveEach;

    const raw = run + gates;
    const mid = Math.max(raw, fenceRates.minimumJob);
    return {
      perFt,
      run,
      walkEach,
      driveEach,
      gates,
      belowMin: raw < fenceRates.minimumJob,
      mid,
      range: estimateRange(mid),
    };
  })();

  const swatch =
    finish === 'bare'
      ? bareSteel
      : color === 'other'
        ? { hex: '#7d7468', edge: '#544d45' }
        : standardColors.find((c) => c.id === color)!;

  const grainName = woodGrains.find((g) => g.id === grain)!.name;
  const finishName = usesGrain
    ? `Wood-grain powder coat, ${grainName}`
    : finish === 'bare'
      ? 'Bare steel'
      : color === 'other'
        ? 'Powder coated, colour of your choice'
        : `Powder coated ${standardColors.find((c) => c.id === color)!.name.toLowerCase()}`;

  const items: LineItem[] = [
    { label: typeDef.name, sub: `${feet} lin ft at ${validHeight} ft`, value: money(calc.run) },
    ...(usesGrain
      ? [{ label: 'Wood-grain finish', sub: grainName, value: 'included', muted: true } as LineItem]
      : []),
    ...(terrain !== 'flat'
      ? [{ label: terrain === 'racked' ? 'Racked to the slope' : 'Stepped down the grade', value: `+ ${Math.round((fenceRates.terrain[terrain] - 1) * 100)}%`, muted: true } as LineItem]
      : []),
    ...(walkGates > 0 ? [{ label: `${walkGates} walk ${walkGates === 1 ? 'gate' : 'gates'}`, value: money(walkGates * calc.walkEach) }] : []),
    ...(driveGates > 0 ? [{ label: `${driveGates} double drive ${driveGates === 1 ? 'gate' : 'gates'}`, value: money(driveGates * calc.driveEach) }] : []),
    ...(calc.belowMin ? [{ label: 'Shop minimum applied', value: money(fenceRates.minimumJob), muted: true } as LineItem] : []),
  ];

  const spec: SpecRow[] = [
    { key: 'Type', value: typeDef.name },
    { key: 'Height', value: `${validHeight} ft` },
    { key: 'Total run', value: `${feet} lin ft` },
    { key: 'Ground', value: terrains.find((t) => t.id === terrain)!.name },
    { key: 'Finish', value: finishName },
    { key: 'Walk gates', value: String(walkGates) },
    { key: 'Drive gates', value: String(driveGates) },
  ];

  return (
    <>
      <BuilderHead
        title="Build a fence"
        blurb="Wood-look privacy, horizontal slat, ranch, continuous pipe or ornamental iron. Pick the finish and the drawing changes with it."
      />

      <BuilderLayout
        rail={
          <>
            <Sheet
              title="Fence elevation"
              scale="Typical bay"
              block={[
                { key: 'Type', val: typeDef.name },
                { key: 'Height', val: `${validHeight}′-0″` },
                { key: 'Run', val: `${feet} ft` },
                { key: 'Ground', val: terrains.find((t) => t.id === terrain)!.name },
              ]}
            >
              <FenceDrawing
                type={type}
                heightFt={validHeight}
                color={swatch.hex}
                edge={swatch.edge}
                woodGrain={usesGrain ? grain : undefined}
                terrain={terrain}
              />
            </Sheet>

            <PriceCard
              items={items}
              totalLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
              totalSub={`about ${money(calc.perFt)} per lin ft`}
              range={calc.range}
              leadWeeks={leadTimeWeeks.fence}
              disclaimer={
                <>
                  A range, not a quote. Post spacing, rock, existing footings and access all
                  move the number. Kelly walks the line and confirms a firm price, free.
                </>
              }
              onQuote={() => setQuoteOpen(true)}
            />
          </>
        }
      >
        <Group n={1} title="What kind of fence" note={typeDef.blurb}>
          <OptionGrid
            columns={2}
            value={type}
            onChange={pickType}
            options={fenceTypes.map((t) => ({ id: t.id, name: t.name, note: t.spec }))}
          />
        </Group>

        <Group n={2} title="Size the run">
          <Field label="Total length" hint={`${feet} linear feet`}>
            <Slider value={feet} onChange={setFeet} min={20} max={1200} step={10} label="Total length" unit="ft" />
          </Field>
          <Field label="Height">
            <Segmented
              value={validHeight}
              onChange={(v) => setHeightFt(v as number)}
              options={typeDef.heights.map((h) => ({ id: h, label: `${h} ft` }))}
            />
          </Field>
          <Field label="The ground it runs over" hint={terrains.find((t) => t.id === terrain)!.note}>
            <OptionGrid
              columns={3}
              value={terrain}
              onChange={setTerrain}
              options={terrains.map((t) => ({ id: t.id, name: t.name }))}
            />
          </Field>
        </Group>

        <Group
          n={3}
          title="Finish"
          note={
            usesGrain
              ? 'Get the beautiful look of wood, that will last forever without any maintenance. Eight wood-grain finishes, baked on.'
              : 'Powder coat is baked on. It will not chip like paint and it holds its colour through Utah summers.'
          }
        >
          {usesGrain ? (
            <Field label="Wood grain" hint={grainName}>
              <Swatches
                value={grain}
                onChange={setGrain}
                options={woodGrains.map((g) => ({
                  id: g.id,
                  name: g.name,
                  render: (
                    <span style={{ display: 'block', height: '100%', background: g.hex, position: 'relative', overflow: 'hidden' }}>
                      <svg viewBox="0 0 100 46" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
                        {[6, 15, 24, 33, 41].map((y, i) => (
                          <path
                            key={y}
                            d={`M-4 ${y} Q30 ${y - 2.5 - (i % 2) * 2} 52 ${y + 1} T104 ${y - 1}`}
                            fill="none"
                            stroke={g.grain}
                            strokeWidth={i % 2 ? 1.1 : 1.7}
                            opacity={0.75}
                          />
                        ))}
                      </svg>
                    </span>
                  ),
                }))}
              />
            </Field>
          ) : (
            <>
              <Field label="Bare or coated">
                <OptionGrid
                  columns={2}
                  value={finish}
                  onChange={setFinish}
                  options={[
                    { id: 'bare' as const, name: 'Bare steel', note: 'Weathers to a rust patina' },
                    { id: 'powder' as const, name: 'Powder coated', note: 'Baked on, holds colour', meta: `+ ${money(fenceRates.finish.powder)}/ft` },
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
            </>
          )}
        </Group>

        <Group n={4} title="Gates in the run" note="Gates are built to match the fence they hang in. Need something bigger or automated? Say so when you send it over.">
          <Field label="Walk gates">
            <Stepper value={walkGates} onChange={setWalkGates} min={0} max={10} label="Walk gates" unit={walkGates === 1 ? 'gate' : 'gates'} />
          </Field>
          <Field label="Double drive gates">
            <Stepper value={driveGates} onChange={setDriveGates} min={0} max={6} label="Drive gates" unit={driveGates === 1 ? 'gate' : 'gates'} />
          </Field>
        </Group>
      </BuilderLayout>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={`Fence · ${typeDef.name}, ${feet} lin ft`}
        spec={spec}
        priceLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
        priceValue={`${money(calc.range[0])} – ${money(calc.range[1])}`}
      />
    </>
  );
}
