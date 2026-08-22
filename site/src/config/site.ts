/**
 * The one absolute URL the site knows about itself. Everything that emits an
 * absolute link — the Open Graph card, the sitemap, robots.txt, canonical
 * URLs, the LocalBusiness schema, the tracked review links in every text the
 * panel sends, the deep link in the owner alert — derives from this constant.
 *
 * accentweldingut.com is the custom domain attached to the Worker since
 * 21 Aug 2026; the old accent-welding.bkthueson.workers.dev address is
 * disabled. (accentwelding.com, without the "ut", belongs to someone else
 * and serves an unrelated IONOS page.)
 */
export const SITE_URL = 'https://accentweldingut.com';
