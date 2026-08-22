import type { Metadata } from 'next';
import { GardenBoxBuilder } from './GardenBoxBuilder';

export const metadata: Metadata = {
  alternates: { canonical: '/build/garden-box' },
  title: 'Build a garden box',
  description:
    'Configure a steel garden box in 15 published sizes, bare or powder coated, and see the exact price and a scale drawing before you order.',
};

export default function Page() {
  return <GardenBoxBuilder />;
}
