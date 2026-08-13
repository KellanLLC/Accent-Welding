/**
 * The one absolute URL the site knows about itself. Everything that emits an
 * absolute link — the Open Graph card, the sitemap, robots.txt, canonical
 * URLs, the LocalBusiness schema — derives from this constant.
 *
 * It is set to where the site is actually served TODAY. It used to say
 * https://accentwelding.com, which broke every link preview: that domain is
 * live but serves an unrelated IONOS site-builder page (published Jun 2024),
 * so scrapers asked it for our card image and got nothing.
 *
 * TODO(kelly): when a real domain is attached to the Worker, change this one
 * line. Note before buying/claiming accentwelding.com: find out who runs the
 * page currently on it — it may be another shop with the same name.
 */
export const SITE_URL = 'https://accent-welding.bkthueson.workers.dev';
