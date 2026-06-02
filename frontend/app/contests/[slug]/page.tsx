import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import { CONTESTS, getContestBySlug } from '@/data/contestsData';
import { ContestDetail } from '@/components/contests/ContestDetail';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return CONTESTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const contest = getContestBySlug(params.slug);
  if (!contest) return { title: 'Not Found | KaamKaaj' };
  return {
    title: `${contest.name} — KaamKaaj Contests`,
    description: contest.description,
    openGraph: {
      title: `${contest.name} — KaamKaaj Contests`,
      description: contest.description,
      type: 'website',
    },
  };
}

// Status-based banner — consistent apna.co teal for live, neutral for closed
function heroBannerCls(status: string) {
  return status === 'live'
    ? 'bg-gradient-to-r from-[#14a085] to-[#0a6b57]'
    : 'bg-gradient-to-r from-gray-500 to-gray-700';
}

export default function ContestDetailPage({ params }: Props) {
  const contest = getContestBySlug(params.slug);
  if (!contest) notFound();

  const pageUrl = `https://kaamkaaj.vercel.app/contests/${contest.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width hero banner */}
      <div
        className={`${heroBannerCls(contest.status)} px-4 py-12 sm:px-6 lg:px-8`}
      >
        <div className="mx-auto max-w-7xl">
          <Link
            href="/contests"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contests
          </Link>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/60">
            {contest.organizer}
          </p>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {contest.name}
          </h1>
          <p className="mt-2 text-base text-white/80">{contest.rewardType}</p>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {contest.participants.toLocaleString()} participants
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" />
              {contest.reward}
            </span>
          </div>
        </div>
      </div>

      <ContestDetail contest={contest} pageUrl={pageUrl} />
    </div>
  );
}
