'use client';

import { useState } from 'react';
import { GateDrawing } from '@/drawings/GateDrawing';
import { BuilderHead, BuilderLayout, Group, PriceCard, Sheet, type LineItem } from '@/components/builder/Builder';
import { QuoteDialog, type SpecRow } from '@/components/builder/QuoteDialog';
import { CheckList, Field, OptionGrid, Segmented, Slider, Swatches } from '@/components/controls';
import {
  bareSteel,
  fenceTypes,
  gateHardware,
  gateUses,
  standardColors,
  woodGrains,
  type FenceTypeId,
  type GateHardwareId,
  type GateUseId,
  type StandardColorId,
  type WoodGrainId,
} from '@/config/products';
import { estimateRange, gateRates, leadTimeWeeks, money, ratesConfirmed } from '@/config/pricing';

type ColorChoice = StandardColorId | 'other';

export function GateBuilder() {
  const [use, setUse] = useState<GateUseId>('double');
  const [widthFt, setWidthFt] = useState(12);
  const [heightFt, setHeightFt] = useState(6);
  const [style, setStyle] = useState<FenceTypeId>('ornamental');
  const [grain, setGrain] = useState<WoodGrainId>('roughSawnCedar');
  const [finish, setFinish] = useState<'bare' | 'powder'>('powder');
  const [color, setColor] = useState<ColorChoice>('black');
  const [hardware, setHardware] = useState<GateHardwareId[]>(['dropRod', 'latchLockable']);
  const [posts, setPosts] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const useDef = gateUses.find((u) => u.id === use)!;
  const styleDef = fenceTypes.find((t) => t.id === style)!;
  const usesGrain = styleDef.woodGrain;

  const width = Math.min(useDef.maxWidthFt, Math.max(useDef.minWidthFt, widthFt));

  function pickUse(next: GateUseId) {
    const d = gateUses.find((u) => u.id === next)!;
    setUse(next);
    setWidthFt(d.defaultWidthFt);
    setHardware((h) =>
      next === 'double' ? h : h.filter((x) => x !== 'dropRod' && x !== 'caneBolt'),
    );
  }

  const calc = (() => {
    const base = gateRates.base[use];
    const extraFt = Math.max(0, width - gateRates.baseWidthFt[use]);
    const extra = extraFt * gateRates.perExtraFoot[use];
    const hMult = gateRates.height[heightFt as keyof typeof gateRates.height] ?? 1;
    const sMult = gateRates.style[style];
    const leaf = (base + extra) * hMult * sMult;
    const hw = hardware.reduce((sum, h) => sum + gateRates.hardware[h], 0);
    const postCost = posts ? gateRates.steelPostsPair : 0;
    const finishCost = usesGrain || finish === 'powder' ? gateRates.finish.powder : 0;
    const mid = leaf + hw + postCost + finishCost;
    return { base, extra, extraFt, leaf, hw, postCost, finishCost, mid, range: estimateRange(mid) };
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

  const availableHardware = gateHardware.filter(
    (h) => use === 'double' || (h.id !== 'dropRod' && h.id !== 'caneBolt'),
  );

  const items: LineItem[] = [
    { label: `${useDef.name}, ${styleDef.name.toLowerCase()}`, sub: `${width} ft × ${heightFt} ft`, value: money(calc.leaf) },
    ...(calc.hw > 0 ? [{ label: 'Hardware', sub: hardware.map((h) => gateHardware.find((g) => g.id === h)!.name).join(', '), value: money(calc.hw) }] : []),
    ...(posts ? [{ label: 'Steel hinge & latch posts', sub: 'Set in concrete, sized to carry the leaf', value: money(calc.postCost) }] : []),
    ...(calc.finishCost > 0 ? [{ label: 'Powder coat', sub: usesGrain ? grainName : undefined, value: money(calc.finishCost) }] : []),
  ];

  const spec: SpecRow[] = [
    { key: 'Gate', value: useDef.name },
    { key: 'Opening', value: `${width} ft clear` },
    { key: 'Height', value: `${heightFt} ft` },
    { key: 'Style', value: styleDef.name },
    { key: 'Finish', value: finishName },
    { key: 'Hardware', value: hardware.length ? hardware.map((h) => gateHardware.find((g) => g.id === h)!.name).join(', ') : 'None' },
    { key: 'Posts', value: posts ? 'Included, set in concrete' : 'Hanging on existing posts' },
  ];

  return (
    <>
      <BuilderHead
        title="Build a gate"
        blurb="Walk gate or a double drive gate, built to match the fence it hangs in. Set the opening and the drawing follows."
      />

      <BuilderLayout
        rail={
          <>
            <Sheet
              title="Gate elevation"
              scale="Looking at the opening"
              block={[
                { key: 'Gate', val: useDef.name },
                { key: 'Clear', val: `${width}′-0″` },
                { key: 'Height', val: `${heightFt}′-0″` },
                { key: 'Style', val: styleDef.name },
              ]}
            >
              <GateDrawing
                use={use}
                widthFt={width}
                heightFt={heightFt}
                style={style}
                color={swatch.hex}
                woodGrain={usesGrain ? grain : undefined}
                hardware={hardware}
              />
            </Sheet>

            <PriceCard
              items={items}
              totalLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
              range={calc.range}
              leadWeeks={leadTimeWeeks.gate}
              disclaimer={
                <>
                  A range, not a quote. A wide drive gate needs heavier posts and deeper
                  footings than a walk gate, and that depends on your ground. Confirmed on a
                  free site visit.
                </>
              }
              onQuote={() => setQuoteOpen(true)}
            />
          </>
        }
      >
        <Group n={1} title="What the gate is for" note={useDef.note}>
          <OptionGrid
            columns={3}
            value={use}
            onChange={pickUse}
            options={gateUses.map((u) => ({ id: u.id, name: u.name, note: u.note }))}
          />
        </Group>

        <Group n={2} title="The opening">
          <Field label="Clear width" hint={`${width} ft between the posts`}>
            <Slider
              value={width}
              onChange={setWidthFt}
              min={useDef.minWidthFt}
              max={useDef.maxWidthFt}
              step={1}
              label="Clear width"
              unit="ft"
            />
          </Field>
          <Field label="Height">
            <Segmented
              value={heightFt}
              onChange={(v) => setHeightFt(v as number)}
              options={[4, 5, 6, 7, 8].map((h) => ({ id: h, label: `${h} ft` }))}
            />
          </Field>
        </Group>

        <Group n={3} title="Match it to the fence" note={styleDef.blurb}>
          <OptionGrid
            columns={2}
            value={style}
            onChange={setStyle}
            options={fenceTypes.map((t) => ({ id: t.id, name: t.name, note: t.spec }))}
          />
        </Group>

        <Group n={4} title="Finish">
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
                          <path key={y} d={`M-4 ${y} Q30 ${y - 2.5 - (i % 2) * 2} 52 ${y + 1} T104 ${y - 1}`} fill="none" stroke={g.grain} strokeWidth={i % 2 ? 1.1 : 1.7} opacity={0.75} />
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
                    { id: 'powder' as const, name: 'Powder coated', note: 'Baked on, holds colour', meta: `+ ${money(gateRates.finish.powder)}` },
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

        <Group n={5} title="Hardware & posts">
          <Field label="Hardware">
            <CheckList
              value={hardware}
              onChange={setHardware}
              options={availableHardware.map((h) => ({
                id: h.id,
                name: h.name,
                note: h.note,
                price: `+ ${money(gateRates.hardware[h.id])}`,
              }))}
            />
          </Field>
          <Field label="Posts">
            <OptionGrid
              columns={2}
              value={posts ? 'yes' : 'no'}
              onChange={(v) => setPosts(v === 'yes')}
              options={[
                { id: 'yes' as const, name: 'Include steel posts', note: 'Set in concrete, sized for the leaf', meta: `+ ${money(gateRates.steelPostsPair)}` },
                { id: 'no' as const, name: 'Hang on existing posts', note: 'Only if they will carry the weight' },
              ]}
            />
          </Field>
        </Group>
      </BuilderLayout>

      <QuoteDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        product={`Gate · ${useDef.name}, ${width} ft × ${heightFt} ft`}
        spec={spec}
        priceLabel={ratesConfirmed ? 'Estimate' : 'Preliminary estimate'}
        priceValue={`${money(calc.range[0])} – ${money(calc.range[1])}`}
      />
    </>
  );
}
