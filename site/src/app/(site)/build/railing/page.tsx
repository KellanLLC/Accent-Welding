import type { Metadata } from 'next';
import { RailingBuilder } from './RailingBuilder';

export const metadata: Metadata = {
  alternates: { canonical: '/build/railing' },
  title: 'Build a railing',
  description:
    'Configure custom metal railing across five build styles and seven picket patterns, at any height and run, and get a priced estimate with a scale drawing.',
};

export default function Page() {
  return <RailingBuilder />;
}
