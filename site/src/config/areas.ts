/**
 * The towns the shop actually drives to, with what is usually asked for in
 * each. Drive times are from the shop at the south end of Utah County
 * (ZIP 84655) and are rounded, not promised. Nothing here claims a job that
 * was not done; each page says what the shop builds and why it suits the
 * place, then hands over to the builders and the phone.
 */

export type Focus = 'railings' | 'fencing' | 'gates' | 'garden-boxes' | 'fabrication';

export type Area = {
  slug: string;
  name: string;
  county: 'Utah County' | 'Juab County';
  /** Minutes from the shop, rounded. 0 means it is the shop's own end of the county. */
  minutes: number;
  /** One line for the hub list. */
  line: string;
  /** Two short paragraphs for the town page, in the house voice. */
  body: [string, string];
  /** Which three things to put first on that page. */
  focus: [Focus, Focus, Focus];
};

export const areas: Area[] = [
  {
    slug: 'santaquin',
    name: 'Santaquin',
    county: 'Utah County',
    minutes: 0,
    line: 'Home ground. Orchards on one side, new streets on the other.',
    body: [
      'This is the shop’s own end of the county, so a site visit here is a short drive rather than an appointment. Santaquin has two kinds of yard: the old lots with pasture and an orchard at the back, and the new subdivisions going in along the bench, and the two want different steel. Post-and-rail or continuous pipe for the first, a wood-look metal privacy fence that will not warp in the wind for the second.',
      'Garden boxes go out of here by the truckload in spring. Fifteen sizes, priced on the site, bare steel or powder coated. If you are in town you can come and see one on the table before you order.',
    ],
    focus: ['fencing', 'garden-boxes', 'gates'],
  },
  {
    slug: 'genola',
    name: 'Genola',
    county: 'Utah County',
    minutes: 5,
    line: 'Big rural lots, horses, and fence that has to hold them.',
    body: [
      'Genola is acreage. Most of what the shop is asked for here is fence that keeps animals where they belong: post-and-rail for the pasture, continuous welded pipe for the corral, and a drive gate wide enough for a trailer. Pipe fence is corral-grade; it takes a shoulder from a horse and stays where you put it.',
      'Long runs are priced by the foot in the fence builder, and a gate can be added into the run so the whole thing is quoted together. The shop walks the line before anything is cut, free.',
    ],
    focus: ['fencing', 'gates', 'fabrication'],
  },
  {
    slug: 'payson',
    name: 'Payson',
    county: 'Utah County',
    minutes: 10,
    line: 'Older homes and new builds side by side. Railing and privacy fence.',
    body: [
      'Payson has an old town with stairs, stoops and basement entries that need a proper guard rail, and new builds to the west and south that need a fence and a gate before the lawn goes in. The shop does both, and it is ten minutes up the road.',
      'For the older homes, a stair rail or a guard rail is measured on site and built to code height in the shop, then set in a morning. For the new builds, the wood-look metal privacy fence gives the look of cedar without the warping, and it goes up on posts set in concrete.',
    ],
    focus: ['railings', 'fencing', 'gates'],
  },
  {
    slug: 'salem',
    name: 'Salem',
    county: 'Utah County',
    minutes: 15,
    line: 'Acreage at the foot of the bench. Ranch fence and ornamental iron.',
    body: [
      'Salem sits between the pond and the bench, and the lots get bigger the closer you get to the hill. The shop is asked for two things here more than anything else: ranch fencing for the larger properties, and ornamental iron with spear finials for the homes that want the front of the lot to look finished.',
      'Ornamental iron between stone or block columns is a job the shop has built in the foothills of this county, and the fence builder will price a run of it by the foot before anyone comes out.',
    ],
    focus: ['fencing', 'gates', 'railings'],
  },
  {
    slug: 'elk-ridge',
    name: 'Elk Ridge',
    county: 'Utah County',
    minutes: 12,
    line: 'Steep lots and long views. Railing that does not block them.',
    body: [
      'Elk Ridge is on the hill, which means decks with a drop under them and yards that fall away. A guard rail here has to be built to the height the drop requires, and it should not wall off the view it was built to protect. Horizontal picket and welded wire both keep the view open; plain square picket at the 4 inch code spacing is the quiet option.',
      'On a sloped yard the fence builder will rack the panels to follow the grade or step them down it, and the drawing shows which before you decide.',
    ],
    focus: ['railings', 'fencing', 'gates'],
  },
  {
    slug: 'woodland-hills',
    name: 'Woodland Hills',
    county: 'Utah County',
    minutes: 12,
    line: 'Bench homes on the mountain. Rails, gates, and fence on a grade.',
    body: [
      'Woodland Hills is built up the side of the mountain, so nearly every job here is on a slope. Guard rails on decks and steps, a gate at the top of a drive, and fence that has to step down a hill without looking like a staircase. That is what the shop gets asked for, and it is a short drive from here.',
      'Everything is measured on site, built on the table in the shop, and set in a day where the job allows. Powder coat is baked on, so it holds up to the weather on the bench.',
    ],
    focus: ['railings', 'gates', 'fencing'],
  },
  {
    slug: 'spanish-fork',
    name: 'Spanish Fork',
    county: 'Utah County',
    minutes: 20,
    line: 'The big town in the south county. A bit of everything.',
    body: [
      'Spanish Fork is the largest town the shop works in regularly, and the work is as mixed as the town: deck railing on the east bench, privacy fencing in the new streets to the west, drive gates on the larger lots along the river, and garden boxes everywhere in spring.',
      'All four have a builder on this site. Set the dimensions, pick the style and the finish, and you will have a number and a scale drawing before anyone drives over. Site visits to confirm are free.',
    ],
    focus: ['railings', 'fencing', 'garden-boxes'],
  },
  {
    slug: 'mapleton',
    name: 'Mapleton',
    county: 'Utah County',
    minutes: 22,
    line: 'Horses, big lots, and fence that has to look the part.',
    body: [
      'Mapleton has the large lots and the horses, and it has the expectation that the fence along the road looks as good as the house behind it. That is ranch fencing done properly: post-and-rail or continuous pipe, powder coated black, with a gate that hangs true on posts sized to carry it.',
      'For the front of the lot, ornamental iron between stone columns is the job the shop is proudest of, and it is built in the shop and set on site in sections.',
    ],
    focus: ['fencing', 'gates', 'railings'],
  },
  {
    slug: 'springville',
    name: 'Springville',
    county: 'Utah County',
    minutes: 25,
    line: 'Old neighbourhoods, new ones on the bench. Rails and fence.',
    body: [
      'Springville has the same mix as its neighbours: established streets where a stair rail or a basement-entry guard rail is overdue, and newer streets up on the bench where a fence and a gate are the first thing the yard needs. The shop covers both, and it is under half an hour away.',
      'A railing is quoted from the railing builder; pick a style, a height and a mount, and the drawing redraws as you go. The firm number comes from a free site visit.',
    ],
    focus: ['railings', 'fencing', 'gates'],
  },
  {
    slug: 'provo',
    name: 'Provo',
    county: 'Utah County',
    minutes: 30,
    line: 'Older housing stock. Guard rails, stair rails, window wells.',
    body: [
      'Provo has a lot of older houses, a lot of basement entries, and a lot of window wells with nothing around them. Guard rails and stair rails are most of what the shop does in town: measured on site, built to code height, core-drilled or plated down, and powder coated so they do not need painting every other year.',
      'Rental owners and property managers ask for the same thing across several houses at once; the railing builder prices one, and the shop will quote the set.',
    ],
    focus: ['railings', 'fencing', 'garden-boxes'],
  },
  {
    slug: 'orem',
    name: 'Orem',
    county: 'Utah County',
    minutes: 35,
    line: 'Established yards and HOAs. Railing, fence, garden boxes.',
    body: [
      'Orem is established neighbourhoods and a fair number of HOAs, which means finishes and heights matter and the fence has to match what is already on the street. The shop builds to the spec you are given: white, black or bronze as standard, any colour on request, and the wood-look privacy panels in eight grains if the rule is "it has to look like wood".',
      'Garden boxes are the other thing: a welded steel bed for a yard that has had timber ones rot twice. Fifteen sizes, priced on the site.',
    ],
    focus: ['fencing', 'railings', 'garden-boxes'],
  },
  {
    slug: 'saratoga-springs',
    name: 'Saratoga Springs',
    county: 'Utah County',
    minutes: 40,
    line: 'New subdivisions and wind off the lake. Fence that does not warp.',
    body: [
      'Saratoga Springs is new streets, new yards and the wind off the lake, which is exactly the place a wood fence warps, greys and pulls its screws in three years. The shop’s answer is the metal privacy fence in a wood-grain powder coat: the look of cedar, welded steel underneath, posts set in concrete, and nothing to rot.',
      'It is a longer drive from the shop, and the site visit is still free. Price the run in the fence builder first and you will know roughly where you stand before you call.',
    ],
    focus: ['fencing', 'gates', 'garden-boxes'],
  },
  {
    slug: 'eagle-mountain',
    name: 'Eagle Mountain',
    county: 'Utah County',
    minutes: 45,
    line: 'Big new lots, HOA rules, and a lot of wind. Fence and gates.',
    body: [
      'Eagle Mountain has the larger new lots, the HOA fence rules, and more wind than anywhere else the shop goes. A metal privacy fence or a horizontal slat fence on steel posts is the thing that is still straight in ten years, and a drive gate built to match it is hung on posts sized to carry it.',
      'The shop drives out to confirm the measurements and the grade, free, once you have priced the run in the builder.',
    ],
    focus: ['fencing', 'gates', 'garden-boxes'],
  },
  {
    slug: 'lehi',
    name: 'Lehi',
    county: 'Utah County',
    minutes: 45,
    line: 'North county. Railing, fencing and gates, same prices, longer drive.',
    body: [
      'Lehi is the far end of the shop’s regular run, and the work is the same as the rest of the county: deck and stair railing, privacy and ornamental fencing, drive and walk gates, garden boxes. The drive is longer; the prices are not different.',
      'Use the builders first. They price the job from the dimensions, and the shop comes out once to confirm before anything is cut.',
    ],
    focus: ['railings', 'fencing', 'gates'],
  },
  {
    slug: 'american-fork',
    name: 'American Fork',
    county: 'Utah County',
    minutes: 40,
    line: 'Established streets and new ones. Railing and fencing.',
    body: [
      'American Fork is a mix of older streets that need a proper guard rail on the front steps and newer ones that need a fence before the grass goes in. The shop builds both in the same insulated shop on the same steel table, and sets them on site.',
      'The railing and fence builders on this site will give you a number and a scale drawing first, and a site visit to confirm it is free.',
    ],
    focus: ['railings', 'fencing', 'gates'],
  },
  {
    slug: 'nephi',
    name: 'Nephi',
    county: 'Juab County',
    minutes: 20,
    line: 'Over the county line. Ranch fencing, pipe corrals, gates.',
    body: [
      'Nephi is just over the line into Juab County and closer to the shop than most of Utah County is. The work here is ranch work: post-and-rail along the road, continuous welded pipe for the corral, and gates wide enough for a stock trailer, all powder coated black so they stay black.',
      'Long runs are priced by the foot in the fence builder, and the shop walks the line before cutting anything, free.',
    ],
    focus: ['fencing', 'gates', 'fabrication'],
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug);

export const focusMeta: Record<Focus, { name: string; href: string; build?: string; line: string }> = {
  railings: { name: 'Railings', href: '/railings', build: '/build/railing', line: 'Guard rail and stair rail, five build styles, built to code height.' },
  fencing: { name: 'Fencing', href: '/fencing', build: '/build/fence', line: 'Wood-look privacy, horizontal slat, ranch, continuous pipe, ornamental iron.' },
  gates: { name: 'Gates', href: '/gates', build: '/build/gate', line: 'Walk, single drive, double drive. Built to match the fence it hangs in.' },
  'garden-boxes': { name: 'Garden boxes', href: '/garden-boxes', build: '/build/garden-box', line: 'Fifteen sizes, published prices, bare steel or powder coated.' },
  fabrication: { name: 'Custom fabrication', href: '/fabrication', line: 'Brackets, stands, repairs, one-offs. MIG and plasma.' },
};
