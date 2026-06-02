'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ChevronRight } from 'lucide-react';
import { type University } from '@/data/degreeData';
import { LoginModal } from '@/components/contests/LoginModal';

interface Props {
  universities: University[];
}

// Enumerate gradient classes so Tailwind JIT includes them
const BANNER_MAP: Record<string, string> = {
  'from-blue-800 to-indigo-900': 'from-blue-800 to-indigo-900',
  'from-red-700 to-orange-800': 'from-red-700 to-orange-800',
  'from-green-700 to-teal-800': 'from-green-700 to-teal-800',
};

type DegreeFilter = 'All' | 'Masters' | 'Bachelors';

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

interface CardProps {
  uni: University;
  onBrochure: () => void;
  onApply: () => void;
}

function UniversityCard({ uni, onBrochure, onApply }: CardProps) {
  const router = useRouter();
  const bannerCls = BANNER_MAP[uni.bannerColor] ?? 'from-blue-800 to-indigo-900';

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/degree/${uni.slug}`)}
    >
      {/* Apna Advantage Assured badge */}
      <div className="absolute right-3 top-3 z-10 rounded-full bg-[#14a085] px-2.5 py-0.5 text-[9px] font-bold text-white">
        ✦ Apna Advantage Assured
      </div>

      {/* Gradient banner strip */}
      <div className={`bg-gradient-to-r ${bannerCls} flex h-28 items-end px-5 pb-4`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-xl font-extrabold text-white ring-2 ring-white/40 backdrop-blur-sm">
          {uni.initials}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 leading-snug">{uni.name}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{uni.location}</p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-700">{uni.rating} / 5</span>
          <span className="text-xs text-gray-400">· {uni.reviewCount} Reviews</span>
        </div>

        {/* Accreditation badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            NAAC {uni.naac}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">UGC</span>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">AICTE</span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">NIRF</span>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onBrochure(); }}
            className="flex-1 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            Brochure
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onApply(); }}
            className="flex-1 rounded-xl bg-[#14a085] py-2 text-xs font-bold text-white transition-colors hover:bg-[#0d8a72]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function DegreeClient({ universities }: Props) {
  const [filter, setFilter] = useState<DegreeFilter>('All');
  const [showBrochure, setShowBrochure] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const universitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const scrollToUniversities = () => {
    universitiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const filtered = universities.filter((u) => {
    if (filter === 'All') return true;
    return u.courses.some((c) => c.level === filter);
  });

  const STATS = [
    { value: '3', label: 'Universities' },
    { value: '10+', label: 'Programs' },
    { value: 'UGC', label: 'Approved' },
    { value: 'NAAC', label: 'Accredited' },
  ];

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      {/* Modals */}
      {showBrochure && <BrochureModal onClose={() => setShowBrochure(false)} />}
      {showLogin && (
        <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
      )}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-[#4d3951] px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70">
              Online Degree Programs
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Explore Top Online<br className="hidden sm:block" /> Degree Programs
            </h1>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Learn from NAAC accredited universities. 100% online, flexible, and free to explore.
            </p>
            <button
              onClick={scrollToUniversities}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#14a085] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0d8a72]"
            >
              Browse Programs <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-12 flex flex-wrap gap-6 sm:gap-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-white/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sticky Filter Bar ──────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Degree Type
            </span>
            <div className="flex gap-2">
              {(['All', 'Masters', 'Bachelors'] as DegreeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    filter === f
                      ? 'bg-[#14a085] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── University Cards ────────────────────────────────────────────── */}
      <div
        ref={universitiesRef}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-500">
            No universities match this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.slug}
                uni={uni}
                onBrochure={() => setShowBrochure(true)}
                onApply={handleApply}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
