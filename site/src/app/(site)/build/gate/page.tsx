import type { Metadata } from 'next';
import { GateBuilder } from './GateBuilder';

export const metadata: Metadata = {
  alternates: { canonical: '/build/gate' },
  title: 'Build a gate',
  description:
    'Configure a walk gate or a double drive gate to match your fence, with hardware and posts, and see a priced estimate with a scale drawing.',
};

export default function Page() {
  return <GateBuilder />;
}
