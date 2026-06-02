'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { type University } from '@/data/degreeData';
import { LoginModal } from '@/components/contests/LoginModal';

interface Props {
  university: University;
}

type TabKey = 'college-info' | 'courses' | 'fees' | 'admission' | 'placements' | 'reviews';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'college-info', label: 'College Info' },
  { key: 'courses', label: 'Courses' },
  { key: 'fees', label: 'Fees' },
  { key: 'admission', label: 'Admission' },
  { key: 'placements', label: 'Placements' },
  { key: 'reviews', label: 'Reviews' },
];

// Enumerate banner gradient classes so Tailwind JIT includes them
const BANNER_MAP: Record<string, string> = {
  'from-blue-800 to-indigo-900': 'from-blue-800 to-indigo-900',
  'from-red-700 to-orange-800': 'from-red-700 to-orange-800',
  'from-green-700 to-teal-800': 'from-green-700 to-teal-800',
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-teal-600'];

function BrochureModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <span className="text-4xl">📄</span>
        <p className="mt-3 font-bold text-gray-900">Brochure not available</p>
        <p className="mt-1 text-sm text-gray-500">
          Brochure not available in this demo version.
        </p>
        <button
          onClick={onClose}
          className="mt-5 rounded-xl bg-[#14a085] px-10 py-2.5 text-sm font-bold text-white hover:bg-[#0d8a72]"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function UniversityDetail({ university }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('college-info');
  const [courseFilter, setCourseFilter] = useState<'All' | 'Masters' | 'Bachelors'>('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showBrochure, setShowBrochure] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const collegeInfoRef = useRef<HTMLDivElement>(null);
  const coursesRef    = useRef<HTMLDivElement>(null);
  const feesRef       = useRef<HTMLDivElement>(null);
  const admissionRef  = useRef<HTMLDivElement>(null);
  const placementsRef = useRef<HTMLDivElement>(null);
  const reviewsRef    = useRef<HTMLDivElement>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // Highlight active tab on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY + 145;
      const sections: [TabKey, React.RefObject<HTMLDivElement>][] = [
        ['college-info', collegeInfoRef],
        ['courses',      coursesRef],
        ['fees',         feesRef],
        ['admission',    admissionRef],
        ['placements',   placementsRef],
        ['reviews',      reviewsRef],
      ];
      let current: TabKey = 'college-info';
      for (const [key, ref] of sections) {
        if (ref.current && ref.current.getBoundingClientRect().top + window.scrollY <= offset) {
          current = key;
        }
      }
      setActiveTab(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const refs: Record<TabKey, React.RefObject<HTMLDivElement>> = {
      'college-info': collegeInfoRef,
      courses:        coursesRef,
      fees:           feesRef,
      admission:      admissionRef,
      placements:     placementsRef,
      reviews:        reviewsRef,
    };
    const el = refs[tab].current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const handleApply = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      setToast('Your interest has been noted. This is a demo.');
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setToast('Your interest has been noted. This is a demo.');
  };

  const bannerCls = BANNER_MAP[university.bannerColor] ?? 'from-blue-800 to-indigo-900';
  const filteredCourses =
    courseFilter === 'All'
      ? university.courses
      : university.courses.filter((c) => c.level === courseFilter);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {showBrochure && <BrochureModal onClose={() => setShowBrochure(false)} />}
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {/* ── Full-width Banner ──────────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${bannerCls} relative h-[200px] overflow-hidden`}>
        {/* Back link */}
        <div className="absolute left-4 top-4 sm:left-8">
          <Link
            href="/degree"
            className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Degrees
          </Link>
        </div>

        {/* Marquee strip at the bottom of the banner */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-black/25 py-2 pointer-events-none">
          <div className="marquee-track">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="px-6 text-[11px] font-bold uppercase tracking-widest text-white/90"
              >
                Apna Advantage Assured &nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page body ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* University Header Card — overlaps the banner with negative margin */}
        <div className="-mt-12 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div
                className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${bannerCls} text-xl font-extrabold text-white shadow-md`}
              >
                {university.initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                  {university.name}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">{university.location}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-base text-yellow-400">★</span>
                  <span className="text-sm font-bold text-gray-800">
                    {university.rating} / 5
                  </span>
                  <span className="text-xs text-gray-400">
                    · {university.reviewCount} Reviews
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                    NAAC {university.naac}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    UGC
                  </span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                    AICTE
                  </span>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                    NIRF #{university.nirfRank}
                  </span>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                    UGC DEB
                  </span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setShowBrochure(true)}
                className="rounded-xl border border-[#14a085] px-5 py-2.5 text-sm font-semibold text-[#14a085] transition-colors hover:bg-[#14a085]/5"
              >
                Brochure
              </button>
              <button
                onClick={handleApply}
                className="rounded-xl bg-[#14a085] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d8a72]"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* ── Sticky Tab Navigation ──────────────────────────────────── */}
        <div className="sticky top-16 z-20 mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
          <div className="flex min-w-max border-b border-gray-100 px-2">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className={`whitespace-nowrap px-5 py-4 text-sm font-semibold transition-colors ${
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

        {/* ── Tab Sections ──────────────────────────────────────────── */}
        <div className="mt-6 space-y-10 pb-16">

          {/* ─ College Info ─────────────────────────────────────────── */}
          <div ref={collegeInfoRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">College Info</h2>

            {/* About */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">
                About {university.name}
              </h3>
              <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                {university.about.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>

            {/* Stat cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { emoji: '🏛️', label: 'Founding Year', value: String(university.founded) },
                { emoji: '🏢', label: 'University Type', value: university.type },
                { emoji: '🏆', label: 'NIRF Ranking',   value: `#${university.nirfRank}` },
                { emoji: '⭐', label: 'Recognition',    value: `NAAC ${university.naac}` },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">{emoji}</span>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                  <p className="mt-0.5 font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Accreditations */}
            <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">Accreditations &amp; Recognition</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">NAAC {university.naac}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">UGC Approved</span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">AICTE Recognised</span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">NIRF Ranked #{university.nirfRank}</span>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">UGC DEB</span>
              </div>
              <ul className="space-y-2">
                {[
                  `NAAC ${university.naac} accredited — one of India's highest quality ratings`,
                  'UGC-approved online degree programs recognised across India',
                  'AICTE recognised institution for technical programs',
                  `NIRF Ranked #${university.nirfRank} among Indian universities`,
                  'UGC DEB compliant for distance education programs',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#14a085]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Latest Updates */}
            <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">Latest Updates</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {university.updates.map((u, i) => (
                  <div key={i} className="w-56 flex-none rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#14a085]">{u.date}</p>
                    <p className="mt-1.5 text-sm leading-snug text-gray-700">{u.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Highlights */}
            <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900">Key Highlights</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {university.highlights.map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center px-6 py-3 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                  >
                    <span className="w-2/5 text-sm font-semibold text-gray-700">{h.param}</span>
                    <span className="flex-1 text-sm text-gray-600">{h.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Courses ──────────────────────────────────────────────── */}
          <div ref={coursesRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">Courses</h2>

            {/* Sub-tabs */}
            <div className="mb-4 flex gap-2">
              {(['All', 'Masters', 'Bachelors'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCourseFilter(lvl)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    courseFilter === lvl
                      ? 'bg-[#14a085] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredCourses.map((course, i) => (
                <div key={i} className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm">
                  <span className="absolute left-0 top-0 rounded-br-xl bg-green-500 px-3 py-1 text-[10px] font-bold text-white">
                    100% Online
                  </span>
                  <div className="mt-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900">{course.name}</h3>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                        {course.level}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { label: 'Duration',      value: course.duration },
                        { label: 'Avg Salary',    value: 'Competitive' },
                        { label: 'Jobs Available', value: course.jobs },
                        { label: 'Viewing now',   value: `${course.viewers} students` },
                      ].map(({ label, value }) => (
                        <span
                          key={label}
                          className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs"
                        >
                          <span className="text-gray-400">{label}: </span>
                          <span className="font-semibold text-gray-700">{value}</span>
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Fees:{' '}
                        <span className="font-semibold text-[#14a085]">Contact for Fees</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowBrochure(true)}
                          className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300"
                        >
                          Brochure
                        </button>
                        <button
                          onClick={handleApply}
                          className="rounded-lg bg-[#14a085] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0d8a72]"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─ Fees ─────────────────────────────────────────────────── */}
          <div ref={feesRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">Fees</h2>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-6 py-4 font-semibold text-gray-700">Course Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Duration</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {university.courses.map((c, i) => (
                    <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/40'}>
                      <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-gray-600">{c.duration}</td>
                      <td className="px-6 py-4 font-semibold text-[#14a085]">Contact University</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-100 bg-blue-50 px-6 py-3">
                <p className="text-xs text-blue-600">
                  💡 This is a demo app. Contact the university directly for accurate fee information.
                </p>
              </div>
            </div>
          </div>

          {/* ─ Admission ────────────────────────────────────────────── */}
          <div ref={admissionRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">Admission</h2>

            {/* Steps */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-6 font-semibold text-gray-900">Admission Process</h3>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-4">
                {[
                  { step: 1, icon: '📝', label: 'Fill Online Application' },
                  { step: 2, icon: '📂', label: 'Document Verification' },
                  { step: 3, icon: '✅', label: 'Enrollment Confirmation' },
                ].map(({ step, icon, label }, idx) => (
                  <div key={step} className="flex flex-1 items-center gap-4 sm:flex-col sm:text-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#14a085]/10 text-2xl">
                      {icon}
                    </div>
                    <div className="sm:mt-1">
                      <span className="inline-block rounded-full bg-[#14a085] px-2 py-0.5 text-[10px] font-bold text-white">
                        Step {step}
                      </span>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{label}</p>
                    </div>
                    {idx < 2 && (
                      <ChevronRight className="hidden h-5 w-5 shrink-0 text-gray-300 sm:block sm:mt-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Masters Programs',
                  list: [
                    "Bachelor's degree in any discipline",
                    'Minimum 50% marks in graduation',
                    'Valid ID and address proof',
                    'Recent passport-size photograph',
                  ],
                },
                {
                  title: 'Bachelors Programs',
                  list: [
                    '10+2 (Higher Secondary) from a recognised board',
                    'Minimum 45% marks in 12th standard',
                    'Valid government-issued ID',
                    'Recent passport-size photograph',
                  ],
                },
              ].map(({ title, list }) => (
                <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
                  <h4 className="mb-3 font-semibold text-gray-900">{title}</h4>
                  <ul className="space-y-2">
                    {list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#14a085]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ─ Placements ───────────────────────────────────────────── */}
          <div ref={placementsRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">Placements</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { emoji: '💰', label: 'Avg Package' },
                { emoji: '🚀', label: 'Highest Package' },
                { emoji: '📊', label: 'Placement Rate' },
                { emoji: '🏢', label: 'Recruiters Count' },
              ].map(({ emoji, label }) => (
                <div key={label} className="rounded-xl bg-white p-4 text-center shadow-sm">
                  <span className="text-2xl">{emoji}</span>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#14a085]">
                    View on University site
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Top Recruiters</h3>
              <div className="flex flex-wrap gap-2">
                {university.placements.recruiters.map((r) => (
                  <span
                    key={r}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─ Reviews ──────────────────────────────────────────────── */}
          <div ref={reviewsRef}>
            <h2 className="mb-4 text-lg font-extrabold text-gray-900">Reviews</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {university.reviews.map((rev, i) => {
                const initials = rev.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{rev.name}</p>
                        <div className="mt-0.5 flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span
                              key={j}
                              className={`text-sm ${j < rev.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{rev.text}</p>
                    <p className="mt-2 text-xs text-gray-400">{rev.date}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
