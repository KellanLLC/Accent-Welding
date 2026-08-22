/**
 * Single source of truth for every business fact on the site.
 *
 * Everything here is transcribed from a real source (the business card, the
 * Facebook About panel, the two Instagram service flyers, the garden box price
 * list). Anything that could NOT be verified is marked TODO and must be
 * confirmed with Kelly before launch. See ../../HANDOFF.md.
 */

export const business = {
  name: 'Accent Welding',
  legalName: 'Accent Welding',
  established: 2025,
  owner: 'Kelly Staheli',
  ownerTitle: 'Owner',

  /**
   * Two numbers are in circulation. 801-691-3685 is on the printed business
   * card AND the garden box price list — the collateral customers already hold
   * — so it leads. 385-241-4679 is on both Instagram flyers and is kept as the
   * secondary text line.
   * TODO(kelly): confirm which should be primary, or drop one.
   */
  phone: '801-691-3685',
  phoneHref: 'tel:+18016913685',
  phoneAlt: '385-241-4679',
  phoneAltHref: 'tel:+13852414679',
  smsHref: 'sms:+18016913685',
  /** The 385 line is the one that takes texts and photos of the job. */
  smsAltHref: 'sms:+13852414679',

  email: 'accentwelding25@gmail.com',
  emailHref: 'mailto:accentwelding25@gmail.com',

  /**
   * The Facebook About panel gives "719 East Center Street, 84655" with NO
   * city. ZIP 84655 is shared by Genola and Santaquin and both have an East
   * Center Street, so the city cannot be inferred. Publishing the wrong city
   * would poison local search, so the site ships as a service-area business:
   * no street address rendered, no city claimed.
   * TODO(kelly): confirm city, then set `addressPublished: true` and fill
   * `street`/`city` to render the address block and switch the schema over.
   */
  addressPublished: false,
  street: '719 East Center Street',
  city: '', // TODO(kelly): 'Santaquin' or 'Genola'
  region: 'UT',
  postalCode: '84655',
  country: 'US',

  serviceArea: 'Utah County and surrounding areas',
  serviceAreaShort: 'Utah County',

  /** Geo centre of ZIP 84655, used only for the service-area circle in schema. */
  geo: { lat: 39.9924, lng: -111.8235, radiusMeters: 64000 },

  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61586631903493',
    instagram: 'https://www.instagram.com/accentwelding25/',
  },

  /**
   * TODO(kelly): Utah contractor licence number + general liability + workers'
   * comp. This is the single strongest trust signal for a shop with no reviews
   * yet. When supplied, set `licensed: true` and fill `licenceNumber` — the
   * footer and the About page both render it automatically.
   */
  licensed: false,
  licenceNumber: '',

  /**
   * TODO(kelly): real hours. Until confirmed the site says "call or text" and
   * makes no hours claim, which is better than an hours claim that is wrong.
   */
  hoursPublished: false,

  taglines: {
    lockup: 'Strength in Steel',
    bio: 'Built right. Built to last.',
    services: 'Railing · Fencing · Custom Fabrication',
  },
} as const;

/**
 * The things the shop makes. In the nav these sit behind one Order control
 * rather than five separate links, so the bar carries one decision instead
 * of a row of them. "Custom & Other" is the board of one-off pieces listed
 * for sale from the panel (/admin → Pieces).
 */
export const products = [
  { href: '/railings', label: 'Railings' },
  { href: '/fencing', label: 'Fencing' },
  { href: '/gates', label: 'Gates' },
  { href: '/garden-boxes', label: 'Garden Boxes' },
  { href: '/custom', label: 'Custom & Other' },
] as const;

/** Everything else in the bar. */
export const nav = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
] as const;
