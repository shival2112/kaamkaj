import type { Metadata } from 'next';
import { UNIVERSITIES } from '@/data/degreeData';
import { DegreeClient } from '@/components/degree/DegreeClient';

export const metadata: Metadata = {
  title: 'Online Degree Programs — KaamKaaj',
  description:
    'Explore top UGC-approved, NAAC accredited online degree programs from leading Indian universities. 100% flexible and free to explore.',
  openGraph: {
    title: 'Online Degree Programs — KaamKaaj',
    description: 'UGC-approved online degrees from NAAC accredited universities.',
    type: 'website',
  },
};

export default function DegreePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DegreeClient universities={UNIVERSITIES} />
    </div>
  );
}
