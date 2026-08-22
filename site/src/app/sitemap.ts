import type { MetadataRoute } from 'next';
import { areas } from '@/config/areas';
import { SITE_URL as SITE } from '@/config/site';

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
  ['/custom', 0.7],
  ['/work', 0.6],
  ['/about', 0.5],
  ['/contact', 0.6],
  ['/service-area', 0.7],
  ['/faq', 0.6],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-21');
  const fixed: MetadataRoute.Sitemap = routes.map(([path, priority]) => ({
    url: SITE + path,
    lastModified,
    changeFrequency: 'monthly',
    priority: priority as number,
  }));
  const towns: MetadataRoute.Sitemap = areas.map((t) => ({
    url: SITE + '/service-area/' + t.slug,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  return [...fixed, ...towns];
}
