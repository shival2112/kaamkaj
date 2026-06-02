import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { getPrepBySlug, PREP_DATA } from '@/data/jobPrepData';
import { ShareSidebar } from '@/components/job-prep/ShareSidebar';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return PREP_DATA.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getPrepBySlug(params.slug);
  if (!entry) return { title: 'Not Found | KaamKaaj' };
  return {
    title: `Practice for ${entry.role} at ${entry.company} | KaamKaaj Job Prep`,
    description: `AI-powered mock interview prep for ${entry.role} at ${entry.company}. ${entry.rounds.length} rounds, ${entry.prepCount} preps done.`,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Technical Knowledge': 'bg-blue-50 text-blue-700',
  'Testing Concepts':   'bg-purple-50 text-purple-700',
  'Problem Solving':    'bg-orange-50 text-orange-700',
  Automation:           'bg-teal-50 text-teal-700',
  'CI/CD':              'bg-indigo-50 text-indigo-700',
  Performance:          'bg-pink-50 text-pink-700',
  Behavioral:           'bg-amber-50 text-amber-700',
  Collaboration:        'bg-cyan-50 text-cyan-700',
  Leadership:           'bg-green-50 text-green-700',
  'System Design':      'bg-violet-50 text-violet-700',
  Architecture:         'bg-sky-50 text-sky-700',
  Scale:                'bg-rose-50 text-rose-700',
  Arrays:               'bg-lime-50 text-lime-700',
  Trees:                'bg-emerald-50 text-emerald-700',
  Graphs:               'bg-teal-50 text-teal-700',
  Conflict:             'bg-red-50 text-red-700',
  Growth:               'bg-green-50 text-green-700',
  'Product Design':     'bg-purple-50 text-purple-700',
  Metrics:              'bg-blue-50 text-blue-700',
  'Trade-offs':         'bg-orange-50 text-orange-700',
  'Data Analysis':      'bg-indigo-50 text-indigo-700',
  'A/B Testing':        'bg-cyan-50 text-cyan-700',
  Estimation:           'bg-amber-50 text-amber-700',
  Prioritization:       'bg-violet-50 text-violet-700',
  'User Research':      'bg-pink-50 text-pink-700',
  'Root Cause Analysis':'bg-rose-50 text-rose-700',
  Roadmap:              'bg-teal-50 text-teal-700',
  Stakeholders:         'bg-lime-50 text-lime-700',
  Impact:               'bg-sky-50 text-sky-700',
  SQL:                  'bg-blue-50 text-blue-700',
  Analysis:             'bg-emerald-50 text-emerald-700',
  Statistics:           'bg-purple-50 text-purple-700',
  'Case Study':         'bg-orange-50 text-orange-700',
  'Funnel Analysis':    'bg-cyan-50 text-cyan-700',
  'Dashboard Design':   'bg-indigo-50 text-indigo-700',
  DSA:                  'bg-violet-50 text-violet-700',
  Database:             'bg-teal-50 text-teal-700',
  'API Design':         'bg-sky-50 text-sky-700',
  'Real-time':          'bg-green-50 text-green-700',
  Reliability:          'bg-rose-50 text-rose-700',
  Protocols:            'bg-blue-50 text-blue-700',
  Routing:              'bg-indigo-50 text-indigo-700',
  Troubleshooting:      'bg-amber-50 text-amber-700',
  VLAN:                 'bg-cyan-50 text-cyan-700',
  Security:             'bg-red-50 text-red-700',
  Optimization:         'bg-lime-50 text-lime-700',
  Teamwork:             'bg-green-50 text-green-700',
  Learning:             'bg-sky-50 text-sky-700',
  'Problem-Solving':    'bg-orange-50 text-orange-700',
  'Cloud Networking':   'bg-blue-50 text-blue-700',
  'SD-WAN':             'bg-teal-50 text-teal-700',
  Consultative:         'bg-purple-50 text-purple-700',
  'Objection Handling': 'bg-rose-50 text-rose-700',
  Requirements:         'bg-indigo-50 text-indigo-700',
};

function categoryClass(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600';
}

export default function JobPrepDetailPage({ params }: Props) {
  const entry = getPrepBySlug(params.slug);
  if (!entry) notFound();

  const pageUrl = `https://kaamkaaj.vercel.app/job-prep/${entry.slug}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#14a085] to-[#0d6e5a] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/job-prep"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Prep
          </Link>
          <div className="flex items-center gap-5">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold ${entry.logoColor.replace('bg-', 'text-')}`}
            >
              {entry.logoInitial}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Practice for {entry.role}
              </h1>
              <p className="mt-1 text-base font-medium text-white/70">{entry.company}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span>{entry.rounds.length} rounds</span>
                <span>·</span>
                <span>{entry.prepCount} preps done</span>
                <span>·</span>
                <span>Salary {entry.salaryRange}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {entry.rounds.length === 0 ? (
              <div className="rounded-xl bg-white px-8 py-16 text-center shadow-sm">
                <span className="text-4xl">🚧</span>
                <p className="mt-4 text-lg font-semibold text-gray-800">
                  Interview prep coming soon!
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  We&apos;re building practice rounds for {entry.role} at {entry.company}.
                  Check back soon.
                </p>
                <Link
                  href="/job-prep"
                  className="mt-5 inline-flex items-center gap-1 rounded-full bg-[#14a085] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d8a72]"
                >
                  Browse available preps
                </Link>
              </div>
            ) : (
              entry.rounds.map((round, roundIdx) => (
                <div
                  key={roundIdx}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  {/* Round header */}
                  <div className="border-b border-gray-100 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-base font-bold text-gray-900">
                        {round.name}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        <Clock className="h-3.5 w-3.5" />
                        {round.duration}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{round.description}</p>
                  </div>

                  {/* Questions */}
                  <div className="divide-y divide-gray-50">
                    {round.questions.map((q, qIdx) => (
                      <div key={qIdx} className="flex items-start gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">
                              {q.duration}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryClass(q.category)}`}
                            >
                              {q.category}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-gray-800 leading-relaxed">
                            {q.text}
                          </p>
                        </div>
                        <Link
                          href={`/job-prep/${entry.slug}/practice/${roundIdx}/${qIdx}`}
                          className="shrink-0 rounded-full bg-[#14a085]/10 px-4 py-2 text-xs font-semibold text-[#14a085] transition-colors hover:bg-[#14a085] hover:text-white"
                        >
                          Practice →
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Round CTA */}
                  <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                    <Link
                      href={`/job-prep/${entry.slug}/practice/${roundIdx}/0`}
                      className="block w-full rounded-xl bg-[#14a085] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#0d8a72]"
                    >
                      Practice {round.name}
                    </Link>
                  </div>
                </div>
              ))
            )}

            {/* Disclaimer */}
            {entry.rounds.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 px-5 py-4 text-sm text-blue-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  All interviews are private and won&apos;t be shared with the recruiters.
                  Your practice sessions are completely confidential.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:sticky lg:top-24 lg:w-72 shrink-0">
            <ShareSidebar url={pageUrl} />

            {/* Quick stats card */}
            <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">About this Prep</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Company</dt>
                  <dd className="font-medium text-gray-900">{entry.company}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Role</dt>
                  <dd className="font-medium text-gray-900 text-right max-w-[140px] truncate">
                    {entry.role}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Rounds</dt>
                  <dd className="font-medium text-gray-900">{entry.rounds.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Preps done</dt>
                  <dd className="font-medium text-[#14a085]">{entry.prepCount}+</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Salary range</dt>
                  <dd className="font-medium text-gray-900">{entry.salaryRange}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
