/**
 * Product specifications. Every style, dimension and finish name below is
 * transcribed from Accent Welding's own two Instagram service flyers or the
 * garden box price list. Nothing here is invented.
 */

/* ──────────────────────────────── RAILING ───────────────────────────────── */

export type RailingStyleId =
  | 'basic'
  | 'doubleRail'
  | 'weldedWire'
  | 'horizontal'
  | 'customPicket';

export const railingStyles: {
  id: RailingStyleId;
  name: string;
  spec: string;
  blurb: string;
}[] = [
  {
    id: 'basic',
    name: 'Basic',
    spec: '2″ posts · 1 × 1½″ rectangular tube frame',
    blurb:
      'The workhorse. Clean vertical pickets in a rectangular tube frame. Nothing to catch, nothing to fail.',
  },
  {
    id: 'doubleRail',
    name: 'Double top & bottom rail',
    spec: 'Pickets held between paired rails',
    blurb:
      'Pickets sit between a doubled top and bottom rail. Reads heavier from the street and stiffens a long run.',
  },
  {
    id: 'weldedWire',
    name: 'Welded wire',
    spec: 'Welded wire infill · short pickets · double top rail',
    blurb:
      'A short picket band under the doubled top rail, and welded mesh filling the panel below it. Keeps dogs and toddlers in without closing off the view.',
  },
  {
    id: 'horizontal',
    name: 'Horizontal picket',
    spec: '1½″ square tube frame',
    blurb:
      'Rails run flat instead of upright. The modern option, and the one that suits a low-slung house.',
  },
  {
    id: 'customPicket',
    name: 'Custom picket',
    spec: 'Decorative picket in a standard frame',
    blurb:
      'Pick the picket. Everything from a plain square bar to a full basket-and-cage.',
  },
];

export type PicketId =
  | 'plainSquare'
  | 'diamondCage'
  | 'knuckleCollar'
  | 'scroll'
  | 'barleyTwist'
  | 'basket'
  | 'ornateBasketCage';

export const pickets: { id: PicketId; name: string; note: string }[] = [
  { id: 'plainSquare', name: 'Plain square', note: 'Square bar, no ornament' },
  { id: 'diamondCage', name: 'Diamond panel', note: 'Diamond cage between rails' },
  { id: 'knuckleCollar', name: 'Knuckle & collar', note: 'Forged collars at mid-height' },
  { id: 'scroll', name: 'Scroll', note: 'Rolled scroll, hand-fitted' },
  { id: 'barleyTwist', name: 'Barley twist', note: 'Twisted bar, full height' },
  { id: 'basket', name: 'Basket', note: 'Woven basket at centre' },
  { id: 'ornateBasketCage', name: 'Basket & cage', note: 'Basket inside a cage, the ornate one' },
];

export const railingHeights = [34, 36, 38, 42] as const;
export type RailingHeight = (typeof railingHeights)[number];

export const railingHeightNotes: Record<RailingHeight, string> = {
  34: 'Low guard, for decks under 30″ and garden steps',
  36: 'Standard residential guard height',
  38: 'A little extra where the drop is steep',
  42: 'Commercial guard height',
};

export const railingMounts = [
  { id: 'coreDrill', name: 'Core-drilled', note: 'Posts set into cored holes in concrete. Strongest.' },
  { id: 'basePlate', name: 'Base plate', note: 'Surface-mounted plates, anchored down.' },
  { id: 'fascia', name: 'Fascia mount', note: 'Bolted to the side of the deck or slab.' },
] as const;
export type RailingMountId = (typeof railingMounts)[number]['id'];

/* ──────────────────────────────── FENCING ───────────────────────────────── */

export type FenceTypeId = 'privacy' | 'slat' | 'pasture' | 'pipe' | 'ornamental';

export const fenceTypes: {
  id: FenceTypeId;
  name: string;
  spec: string;
  blurb: string;
  heights: number[];
  woodGrain: boolean;
}[] = [
  {
    id: 'privacy',
    name: 'Metal privacy, wood-look',
    spec: 'Steel panels, wood-grain powder coat',
    blurb:
      'The beautiful look of wood that lasts forever without any maintenance. No warping, no rot.',
    heights: [5, 6, 7, 8],
    woodGrain: true,
  },
  {
    id: 'slat',
    name: 'Horizontal slat',
    spec: 'Flat slats on a steel frame',
    blurb: 'A more modern spin on a privacy fence. Slats with a deliberate gap, or run tight.',
    heights: [5, 6, 7],
    woodGrain: false,
  },
  {
    id: 'pasture',
    name: 'Pasture & ranch',
    spec: 'Post and rail',
    blurb:
      'Great for keeping animals in, or if you just want to add a bit of ranch style to your property.',
    heights: [4, 5, 6],
    woodGrain: false,
  },
  {
    id: 'pipe',
    name: 'Continuous pipe',
    spec: 'Welded pipe rails, no gaps',
    blurb: 'Corral-grade. Takes a shoulder from a horse and stays where you put it.',
    heights: [4, 5, 6],
    woodGrain: false,
  },
  {
    id: 'ornamental',
    name: 'Ornamental iron',
    spec: 'Spear finials, pickets on a tube frame',
    blurb:
      'The one that goes between stone columns and finishes a house. Spear finials as standard.',
    heights: [4, 5, 6],
    woodGrain: false,
  },
];

/** The eight wood-grain powder coat finishes, exactly as named on the flyer. */
export const woodGrains = [
  { id: 'roughSawnCedar', name: 'Rough Sawn Distressed Cedar', hex: '#8A4A2A', grain: '#5E2F18' },
  { id: 'primitivePine', name: 'Primitive Pine', hex: '#B87A42', grain: '#8A5327' },
  { id: 'roughEdgeBarnwood', name: 'Rough Edge Barnwood Plank', hex: '#7C6B5C', grain: '#4E4136' },
  { id: 'knottyAlder', name: 'Knotty Alder Plank', hex: '#C08A4E', grain: '#95632F' },
  { id: 'grayDistressed', name: 'Gray Distressed Barnwood', hex: '#8C8880', grain: '#5F5C55' },
  { id: 'burntCharcoal', name: 'Burnt Wood Charcoal', hex: '#3A3735', grain: '#232120' },
  { id: 'grayWashed', name: 'Gray Washed Barnwood', hex: '#A79B8C', grain: '#7B7062' },
  { id: 'chippyWhite', name: 'Chippy White', hex: '#DED8CE', grain: '#B3A997' },
] as const;
export type WoodGrainId = (typeof woodGrains)[number]['id'];

export const terrains = [
  { id: 'flat', name: 'Flat', note: 'Level run, panels sit square' },
  { id: 'stepped', name: 'Stepped', note: 'Panels stay level and step down the grade' },
  { id: 'racked', name: 'Racked', note: 'Panels built to follow the slope' },
] as const;
export type TerrainId = (typeof terrains)[number]['id'];

/* ───────────────────────────────── GATES ────────────────────────────────── */

export type GateUseId = 'walk' | 'single' | 'double';

export const gateUses: {
  id: GateUseId;
  name: string;
  note: string;
  defaultWidthFt: number;
  minWidthFt: number;
  maxWidthFt: number;
}[] = [
  { id: 'walk', name: 'Walk gate', note: 'One leaf, person-width', defaultWidthFt: 4, minWidthFt: 3, maxWidthFt: 6 },
  { id: 'single', name: 'Single drive gate', note: 'One leaf across a drive', defaultWidthFt: 10, minWidthFt: 8, maxWidthFt: 16 },
  { id: 'double', name: 'Double drive gate', note: 'Two leaves meeting in the middle', defaultWidthFt: 12, minWidthFt: 10, maxWidthFt: 24 },
];

export const gateHardware = [
  { id: 'dropRod', name: 'Drop rod', note: 'Pins the passive leaf into the ground' },
  { id: 'caneBolt', name: 'Cane bolt', note: 'Heavier drop pin for a drive gate' },
  { id: 'selfClosingHinge', name: 'Self-closing hinges', note: 'Swings shut on its own' },
  { id: 'latchLockable', name: 'Lockable latch', note: 'Takes a padlock' },
] as const;
export type GateHardwareId = (typeof gateHardware)[number]['id'];

/* ─────────────────────────────── FINISHES ───────────────────────────────── */

export const standardColors = [
  { id: 'white', name: 'White', hex: '#EDEAE4', edge: '#C4BEB2' },
  { id: 'black', name: 'Black', hex: '#2A2827', edge: '#161514' },
  { id: 'bronze', name: 'Bronze', hex: '#5C4128', edge: '#3A2917' },
] as const;
export type StandardColorId = (typeof standardColors)[number]['id'];

export const bareSteel = { hex: '#6E6A66', edge: '#494643' };

/* ─────────────────────────── REELS / SHOP FLOOR ─────────────────────────── */

/** Their own reels, with their own captions. Real view counts as published. */
export const reels = [
  { file: 'reel-5-measure-cut-cap', caption: 'Measure, Cut, Cap. Repeat', views: 387, seconds: 29 },
  { file: 'reel-2-plasma-custom-piece', caption: 'The plasma makes quick work of this custom piece', views: 63, seconds: 29 },
  { file: 'reel-1-out-with-the-old', caption: 'Out with the old in with the new', views: 400, seconds: 9 },
  { file: 'reel-4-posts-in-the-ground', caption: 'Got posts in the ground, stay tuned for the rails tomorrow', views: 236, seconds: 11 },
  { file: 'reel-3-tomorrow-fun-begins', caption: 'Tomorrow the fun part begins', views: 410, seconds: 12 },
  { file: 'reel-6-rate-this-fence', caption: 'Rate this fence 1–10', views: 42, seconds: 19 },
  { file: 'reel-8-miller-252', caption: 'Got the Miller 252 running nice', views: 914, seconds: 12 },
  { file: 'reel-7-would-you-use-these-dirtbike', caption: 'Would you use these?', views: 643, seconds: 7 },
] as const;
