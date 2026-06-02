'use client';

import { useState } from 'react';
import { Users, Trophy, Calendar, ChevronDown, Check } from 'lucide-react';
import { type Contest } from '@/data/contestsData';
import { CountdownTimer } from './CountdownTimer';
import { LoginModal } from './LoginModal';
import { ShareSidebar } from '@/components/job-prep/ShareSidebar';

interface Props {
  contest: Contest;
  pageUrl: string;
}

type Tab =
  | 'description'
  | 'eligibility'
  | 'rounds'
  | 'rewards'
  | 'organiser'
  | 'faq';

const TABS: { key: Tab; label: string }[] = [
  { key: 'description', label: 'Description' },
  { key: 'eligibility', label: 'Eligibility' },
  { key: 'rounds', label: 'Rounds' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'organiser', label: 'About the Organizer' },
  { key: 'faq', label: 'FAQ' },
];

export function ContestDetail({ contest, pageUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRegisterClick = () => {
    if (isRegistered) return;
    setShowModal(true);
  };

  const handleLogin = () => {
    setShowModal(false);
    setIsRegistered(true);
  };

  const deadline = new Date(contest.registrationDeadline);
  const formattedDeadline = deadline.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {showModal && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowModal(false)} />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Main content ──────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Tab navigation */}
            <div className="overflow-x-auto rounded-t-xl bg-white shadow-sm">
              <div className="flex min-w-max border-b border-gray-100 px-2">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`whitespace-nowrap px-4 py-4 text-sm font-semibold transition-colors ${
                      activeTab === key
                        ? 'border-b-2 border-[#14a085] text-[#14a085]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="rounded-b-xl bg-white px-6 py-6 shadow-sm">
              {activeTab === 'description' && (
                <div className="space-y-4 text-sm leading-relaxed text-gray-700">
                  <p>{contest.description}</p>
                  <p>
                    This is an excellent opportunity to challenge yourself and
                    connect with like-minded participants from across India.
                    Whether you&apos;re a student, fresher, or working professional,
                    this contest welcomes everyone willing to learn and grow.
                  </p>
                  <p>
                    Organised by{' '}
                    <span className="font-semibold text-gray-900">
                      {contest.organizer}
                    </span>
                    , this contest is completely free to join and offers valuable
                    experience, certificates, and community recognition.
                  </p>
                  {contest.partners.length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Partners
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {contest.partners.map((p) => (
                          <span
                            key={p}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'eligibility' && (
                <ul className="space-y-3">
                  {contest.eligibility.map((e, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3 w-3 text-green-600" />
                      </span>
                      <span className="text-sm text-gray-700">{e}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'rounds' && (
                <div className="space-y-4">
                  {contest.rounds.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-gray-100 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">
                          Round {i + 1}: {r.name}
                        </h3>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#14a085]">
                          {r.duration}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {r.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'rewards' && (
                <ul className="space-y-3">
                  {contest.prizes.map((p, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-sm text-gray-700">{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'organiser' && (
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {contest.organizer}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {contest.organiserAbout}
                  </p>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-2">
                  {contest.faq.map((item, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-xl border border-gray-100"
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === i ? null : i)
                        }
                        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {item.q}
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150 ${
                            openFaq === i ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-72">
            {/* Register card */}
            <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
              {contest.status === 'live' ? (
                isRegistered ? (
                  <button
                    disabled
                    className="flex w-full cursor-default items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-white"
                  >
                    <Check className="h-4 w-4" />
                    Registered ✓
                  </button>
                ) : (
                  <button
                    onClick={handleRegisterClick}
                    className="w-full rounded-xl bg-[#14a085] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0d8a72]"
                  >
                    Register Now
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl bg-gray-200 py-3 text-sm font-semibold text-gray-500"
                >
                  Registration Closed
                </button>
              )}

              {/* Stats */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Users className="h-4 w-4" />
                    Participants
                  </span>
                  <span className="font-semibold text-gray-900">
                    {contest.participants.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {contest.status === 'live' ? 'Deadline' : 'Closed on'}
                  </span>
                  <span className="max-w-[140px] text-right text-xs font-semibold text-gray-900">
                    {formattedDeadline}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Prize
                  </span>
                  <span className="max-w-[140px] text-right text-xs font-semibold text-[#14a085]">
                    {contest.reward}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              {contest.status === 'live' && (
                <div className="flex justify-center rounded-lg bg-red-50 p-3">
                  <CountdownTimer deadline={contest.registrationDeadline} />
                </div>
              )}
            </div>

            {/* Share */}
            <ShareSidebar url={pageUrl} />
          </aside>

        </div>
      </div>
    </>
  );
}
