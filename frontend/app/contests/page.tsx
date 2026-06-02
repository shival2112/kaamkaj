import type { Metadata } from 'next';
import { CONTESTS } from '@/data/contestsData';
import { ContestsClient } from '@/components/contests/ContestsClient';

export const metadata: Metadata = {
  title: 'Contests — KaamKaaj',
  description:
    'Participate in free contests and hackathons. Showcase your skills, win exciting rewards, and connect with learners across India.',
  openGraph: {
    title: 'Contests — KaamKaaj',
    description: 'Free competitions to showcase your skills and win rewards.',
    type: 'website',
  },
};

export default function ContestsPage() {
  return <ContestsClient contests={CONTESTS} />;
}
