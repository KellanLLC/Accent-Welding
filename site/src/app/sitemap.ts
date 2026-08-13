import type { MetadataRoute } from 'next';

const SITE = 'https://accentwelding.com'; // TODO(kelly): confirm final domain

const routes = [
  ['', 1],
  ['/build', 0.9],
  ['/build/railing', 0.9],
  ['/build/fence', 0.9],
  ['/build/gate', 0.9],
  ['/build/garden-box', 0.9],
  ['/railings', 0.8],
  ['/fencing', 0.8],
  ['/gates', 0.8],
  ['/garden-boxes', 0.8],
  ['/fabrication', 0.7],
  ['/work', 0.6],
  ['/about', 0.5],
  ['/contact', 0.6],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-11');
  return routes.map(([path, priority]) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: priority as number,
  }));
}
