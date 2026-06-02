import type { Metadata } from 'next';
import { JobPrepLanding } from '@/components/job-prep/JobPrepLanding';

export const metadata: Metadata = {
  title: 'Job Prep — AI Mock Interview Coach | KaamKaaj',
  description:
    'Practice interviews with a free AI interview coach. 45K+ preps done for Google, Zomato, Cisco, and 20+ top companies.',
  openGraph: {
    title: 'Job Prep — AI Mock Interview | KaamKaaj',
    description: 'Practice with AI for your next interview at top companies.',
    type: 'website',
    siteName: 'KaamKaaj',
  },
};

export default function JobPrepPage() {
  return <JobPrepLanding />;
}
