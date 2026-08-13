import type { MetadataRoute } from 'next';

const SITE = 'https://accentwelding.com'; // TODO(kelly): confirm final domain

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
