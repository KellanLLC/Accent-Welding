import type { Metadata } from 'next';
import { FenceBuilder } from './FenceBuilder';

export const metadata: Metadata = {
  alternates: { canonical: '/build/fence' },
  title: 'Build a fence',
  description:
    'Configure metal privacy, horizontal slat, ranch, continuous pipe or ornamental iron fencing, with eight wood-grain finishes, and see a priced estimate.',
};

export default function Page() {
  return <FenceBuilder />;
}
