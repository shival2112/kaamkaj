'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, ChevronRight } from 'lucide-react';
import { type Contest } from '@/data/contestsData';
import { CountdownTimer } from './CountdownTimer';

interface Props {
  contests: Contest[];
}

const DAY_MS = 86_400_000;

// Status-based banner — consistent apna.co teal for live, neutral gray for closed
function bannerCls(status: string) {
  return status === 'live'
    ? 'bg-gradient-to-r from-[#14a085] to-[#0a6b57]'
    : 'bg-gradient-to-r from-gray-500 to-gray-700';
}

type Filter = 'all' | 'live' | 'closed';
type Tab = 'all' | 'registered';

function ContestCard({ contest }: { contest: Contest }) {
  // "Register Now" + countdown only when deadline is within the next 24 h
  const msLeft = new Date(contest.registrationDeadline).getTime() - Date.now();
  const isUrgent = contest.status === 'live' && msLeft > 0 && msLeft <= DAY_MS;
  const showRegister = isUrgent;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Banner */}
      <div className={`${bannerCls(contest.status)} px-6 py-8`}>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-white/60">
          {contest.organizer}
        </p>
        <h3 className="text-xl font-extrabold leading-tight text-white">
          {contest.name}
        </h3>
        <p className="mt-1 text-xs text-white/70">{contest.rewardType}</p>
      </div>

      {/* Card body */}
      <div className="space-y-3 p-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {contest.name}
          </p>
          {contest.status === 'live' ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
              Closed
            </span>
          )}
        </div>

        {/* Reward + participants */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            {contest.reward}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {contest.participants.toLocaleString()} participants
          </span>
        </div>

        {/* Countdown — only renders when within 24 h (CountdownTimer self-guards) */}
        {isUrgent && <CountdownTimer deadline={contest.registrationDeadline} />}

        {/* CTA — "Register Now" only when deadline < 24 h; otherwise "View Contest" */}
        <div className="pt-1">
          <Link
            href={`/contests/${contest.slug}`}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors ${
              showRegister
                ? 'bg-[#14a085] text-white hover:bg-[#0d8a72]'
                : 'border border-[#14a085] text-[#14a085] hover:bg-[#14a085]/5'
            }`}
          >
            {showRegister ? 'Register Now' : 'View Contest'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ContestsClient({ contests }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [tab, setTab] = useState<Tab>('all');

  const liveCount = contests.filter((c) => c.status === 'live').length;
  const closedCount = contests.filter((c) => c.status === 'closed').length;

  const visible =
    tab === 'registered'
      ? []
      : contests.filter((c) => {
          if (filter === 'live') return c.status === 'live';
          if (filter === 'closed') return c.status === 'closed';
          return true;
        });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">

          {/* ── Left sidebar ──────────────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            {/* Filters */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-gray-700">🔽 Filters</p>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Contests
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: 'all', label: 'All', count: null },
                    { key: 'live', label: 'Live', count: liveCount },
                    { key: 'closed', label: 'Closed', count: closedCount },
                  ] as const
                ).map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      filter === key
                        ? 'bg-[#14a085] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {count !== null && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                          filter === key
                            ? 'bg-white/25 text-white'
                            : key === 'live'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Promo card */}
            <div className="relative overflow-hidden rounded-xl border border-pink-100 bg-pink-50 p-5">
              <h3 className="text-lg font-extrabold text-red-600">Contests</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-gray-600">
                Unlock opportunities, one challenge at a time
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  'Explore free competitions',
                  'Showcase your skills',
                  'Win exciting rewards',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14a085]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-right text-5xl">🏆</div>
            </div>
          </aside>

          {/* ── Center column ─────────────────────────────────────────────── */}
          <main>
            {/* Tab bar */}
            <div className="flex gap-1 rounded-t-xl border-b border-gray-200 bg-white px-4">
              {(
                [
                  { key: 'all', label: 'All Contests' },
                  { key: 'registered', label: 'Registered Contests' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-4 text-sm font-semibold transition-colors ${
                    tab === key
                      ? 'border-b-2 border-[#14a085] text-[#14a085]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4">
              {tab === 'registered' ? (
                <div className="rounded-xl bg-white px-8 py-14 text-center shadow-sm">
                  <span className="text-5xl">🏆</span>
                  <p className="mt-4 font-semibold text-gray-800">
                    No registered contests yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Register for a contest to track it here.
                  </p>
                  <button
                    onClick={() => setTab('all')}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#14a085] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d8a72]"
                  >
                    Browse contests
                  </button>
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-xl bg-white px-8 py-14 text-center shadow-sm">
                  <p className="text-sm text-gray-500">
                    No contests match this filter.
                  </p>
                </div>
              ) : (
                visible.map((c) => <ContestCard key={c.slug} contest={c} />)
              )}
            </div>
          </main>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">About Contests</p>
              <div className="my-4 flex justify-center text-6xl">🎯</div>
              <ul className="space-y-3">
                {[
                  'Participate in free, community-driven challenges',
                  'Build real-world skills and get recognised',
                  'Connect with learners across India',
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#14a085]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
