/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PRICING — the only file with money in it.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  TWO KINDS OF NUMBER LIVE HERE. Do not confuse them.
 *
 *  ✅ VERIFIED   Transcribed from Accent Welding's own published garden box
 *                price list (content/facebook/photos/fb-01-pricelist-UPRIGHT.jpg).
 *                These are real. The garden box configurator quotes them exactly.
 *
 *  ⚠️ PLACEHOLDER  Railing, fencing and gate rates. Accent Welding has never
 *                published these. The numbers below are industry-plausible
 *                placeholders so the pricing engine is complete and testable.
 *                THEY ARE NOT KELLY'S PRICES. Every configurator that uses them
 *                shows an *estimated range*, never an exact figure, and says so
 *                on screen.
 *
 *  → Before launch, replace every value under RATES_TO_CONFIRM with Kelly's
 *    real numbers and flip `ratesConfirmed` to true. That single flag switches
 *    the UI from "Preliminary estimate" to "Estimate", tightens the range from
 *    ±22% to ±10%, and is the only change needed. See ../../HANDOFF.md.
 */

export const ratesConfirmed = false;

/** Range width applied around the computed midpoint estimate. */
export const estimateSpread = ratesConfirmed ? 0.1 : 0.22;

/* ───────────────────────── GARDEN BOXES — ✅ VERIFIED ───────────────────── */

export type BoxFootprint = '8x4' | '4x4' | '4x2' | '4x1' | '2x1';
export type BoxHeight = 24 | 18 | 12;

export const boxFootprints: {
  id: BoxFootprint;
  lengthFt: number;
  widthFt: number;
  label: string;
}[] = [
  { id: '8x4', lengthFt: 8, widthFt: 4, label: '8 ft × 4 ft' },
  { id: '4x4', lengthFt: 4, widthFt: 4, label: '4 ft × 4 ft' },
  { id: '4x2', lengthFt: 4, widthFt: 2, label: '4 ft × 2 ft' },
  { id: '4x1', lengthFt: 4, widthFt: 1, label: '4 ft × 1 ft' },
  { id: '2x1', lengthFt: 2, widthFt: 1, label: '2 ft × 1 ft' },
];

export const boxHeights: BoxHeight[] = [24, 18, 12];

/**
 * The published price list, exactly as printed. [bare steel, powder coated].
 * All 15 rows. No interpolation, no invented sizes.
 */
export const boxPrices: Record<BoxFootprint, Record<BoxHeight, [number, number]>> = {
  '8x4': { 24: [1350, 1850], 18: [1200, 1650], 12: [1075, 1475] },
  '4x4': { 24: [1080, 1480], 18: [960, 1335], 12: [840, 1190] },
  '4x2': { 24: [900, 1275], 18: [810, 1160], 12: [720, 1045] },
  '4x1': { 24: [750, 1050], 18: [670, 970], 12: [600, 850] },
  '2x1': { 24: [540, 840], 18: [480, 730], 12: [420, 670] },
};

/** Colours named on the price list. Anything else is priced on request. */
export const boxColors = ['White', 'Black', 'Bronze'] as const;
export type BoxColor = (typeof boxColors)[number];

/* ─────────────── RATES_TO_CONFIRM — ⚠️ PLACEHOLDER, NOT REAL ────────────── */

/** Railing, per linear foot of finished rail, supply + install, bare steel. */
export const railingRates = {
  /** Base rate by build style. */
  style: {
    basic: 82, // 2" posts, 1 × 1½" rectangular tube frame
    doubleRail: 96, // double top + double bottom rail, pickets in the middle
    weldedWire: 104, // welded wire, short pickets, double top rail
    horizontal: 112, // horizontal picket, 1½" square tube frame
    customPicket: 118, // decorative picket styles
  },
  /** Upcharge per linear foot for a decorative picket. */
  picket: {
    plainSquare: 0,
    diamondCage: 26,
    knuckleCollar: 22,
    scroll: 34,
    barleyTwist: 24,
    basket: 30,
    ornateBasketCage: 42,
  },
  /** Multiplier on the base rate by finished height. */
  height: { 34: 0.94, 36: 1, 38: 1.06, 42: 1.16 },
  /** One-off adders. */
  rakedSection: 145, // per stair run — raked rails are cut and fitted individually
  corner: 40, // per corner post
  mount: { coreDrill: 0, basePlate: 14, fascia: 26 }, // per linear foot
  /** Finish, per linear foot, on top of bare steel. */
  finish: { bare: 0, powder: 28 },
  minimumJob: 950,
} as const;

/** Fencing, per linear foot, supply + install, posts set in concrete. */
export const fenceRates = {
  type: {
    privacy: 96, // metal privacy, wood-grain powder coat
    slat: 88, // modern horizontal slat
    pasture: 34, // post and rail
    pipe: 29, // continuous pipe
    ornamental: 78, // ornamental iron, spear finials
  },
  /** Multiplier by finished height, per type family. */
  height: { 3: 0.72, 4: 0.84, 5: 0.93, 6: 1, 7: 1.1, 8: 1.22 },
  /** Wood-grain powder coat is a premium finish over a plain colour. */
  woodGrainUpcharge: 17, // per linear foot
  finish: { bare: 0, powder: 22 },
  /** Sloped ground costs more: racked panels are built to the grade. */
  terrain: { flat: 1, stepped: 1.06, racked: 1.13 },
  minimumJob: 1400,
} as const;

/** Gates, each. */
export const gateRates = {
  base: {
    walk: 640, // single walk gate, up to 4 ft
    single: 980, // single drive gate
    double: 1760, // double drive gate
  },
  /** Per foot of leaf width beyond the base width. */
  perExtraFoot: { walk: 130, single: 165, double: 190 },
  baseWidthFt: { walk: 4, single: 10, double: 12 },
  /** Multiplier by leaf height. */
  height: { 4: 0.9, 5: 0.97, 6: 1, 7: 1.09, 8: 1.2 },
  /** Style follows the fence it hangs in; ornamental and privacy cost more. */
  style: { pasture: 0.82, pipe: 0.78, slat: 1, privacy: 1.08, ornamental: 1.14 },
  hardware: {
    dropRod: 85,
    caneBolt: 95,
    selfClosingHinge: 130,
    latchLockable: 70,
  },
  steelPostsPair: 420, // heavy hinge + latch posts set in concrete
  finish: { bare: 0, powder: 240 },
} as const;

/* ────────────────────────────── LEAD TIMES ──────────────────────────────── */

/**
 * TODO(kelly): "fast turnaround" is claimed on Facebook but never quantified.
 * These are the ranges the site quotes. Confirm or correct them.
 */
export const leadTimeWeeks = {
  gardenBox: [1, 2],
  railing: [2, 3],
  fence: [3, 4],
  gate: [2, 3],
} as const;

/* ──────────────────────────────── HELPERS ───────────────────────────────── */

export function money(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/** Round to a sensible quoting increment so estimates don't read false-precise. */
export function roundEstimate(n: number): number {
  if (n < 1000) return Math.round(n / 5) * 5;
  if (n < 5000) return Math.round(n / 25) * 25;
  return Math.round(n / 50) * 50;
}

export function estimateRange(mid: number): [number, number] {
  return [
    roundEstimate(mid * (1 - estimateSpread)),
    roundEstimate(mid * (1 + estimateSpread)),
  ];
}
