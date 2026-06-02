'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  ArrowRight,
  Play,
} from 'lucide-react';
import {
  PREP_DATA,
  CATEGORIES,
  SECTION_LABELS,
  type PrepEntry,
} from '@/data/jobPrepData';

type SectionKey = 'GLOBAL_TECH' | 'INDIAN_STARTUPS' | 'GLOBAL_MNCS';
const SECTIONS: SectionKey[] = ['GLOBAL_TECH', 'INDIAN_STARTUPS', 'GLOBAL_MNCS'];

const CAROUSEL_ITEMS = PREP_DATA.filter((p) => p.rounds.length > 0);

export function JobPrepLanding() {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('TECH');
  const [companyQuery, setCompanyQuery] = useState('');
  const [roleQuery, setRoleQuery] = useState('');
  const [showCompanyDD, setShowCompanyDD] = useState(false);
  const [showRoleDD, setShowRoleDD] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const companyRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(e.target as Node))
        setShowCompanyDD(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node))
        setShowRoleDD(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const allCompanies = Array.from(new Set(PREP_DATA.map((p) => p.company))).sort();
  const allRoles = Array.from(new Set(PREP_DATA.map((p) => p.role))).sort();

  const filteredCompanies = allCompanies.filter((c) =>
    c.toLowerCase().includes(companyQuery.toLowerCase()),
  );
  const filteredRoles = allRoles.filter((r) =>
    r.toLowerCase().includes(roleQuery.toLowerCase()),
  );

  const hasFilters = !!(selectedCompany || selectedRole);

  function getCardsForSection(section: SectionKey): PrepEntry[] {
    const byCategory = PREP_DATA.filter(
      (p) => p.section === section && p.category === activeCategory,
    );
    // Fallback to all section cards if active category has no matches here
    const base = byCategory.length > 0 ? byCategory : PREP_DATA.filter((p) => p.section === section);
    if (!hasFilters) return base;
    return base.filter(
      (p) =>
        (!selectedCompany || p.company === selectedCompany) &&
        (!selectedRole || p.role === selectedRole),
    );
  }

  function getFilteredFlat(): PrepEntry[] {
    return PREP_DATA.filter(
      (p) =>
        (!selectedCompany || p.company === selectedCompany) &&
        (!selectedRole || p.role === selectedRole),
    );
  }

  const visibleCarousel = [0, 1].map(
    (offset) => CAROUSEL_ITEMS[(carouselIdx + offset) % CAROUSEL_ITEMS.length],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
            {/* Left copy */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#14a085]/10 px-3 py-1.5 text-sm font-semibold text-[#14a085]">
                <span className="text-base">🤖</span>
                AI Interview Coach
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Job Prep
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Practice interviews with Free AI Interview Coach
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#14a085]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#14a085]">
                  45.7K PREPS DONE
                </span>
              </div>
              <button className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#14a085] px-5 py-2.5 text-sm font-semibold text-[#14a085] transition-colors hover:bg-[#14a085] hover:text-white">
                <Play className="h-4 w-4 fill-current" />
                Watch Demo
              </button>
            </div>

            {/* Carousel */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setCarouselIdx(
                      (i) => (i - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length,
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition hover:shadow-lg"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex flex-1 gap-3 overflow-hidden">
                  {visibleCarousel.map((item, i) => (
                    <Link
                      key={`${item.slug}-${i}`}
                      href={`/job-prep/${item.slug}`}
                      className="flex-1 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-base font-bold text-white ${item.logoColor}`}
                      >
                        {item.logoInitial}
                      </div>
                      <p className="mt-2 text-xs font-medium text-gray-400">
                        {item.company}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900">
                        {item.role}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <Clock className="h-3 w-3" />
                        5 min AI Interview
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCarouselIdx((i) => (i + 1) % CAROUSEL_ITEMS.length)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition hover:shadow-lg"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Carousel dots */}
              <div className="mt-3 flex justify-center gap-1.5">
                {CAROUSEL_ITEMS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === carouselIdx
                        ? 'w-5 bg-[#14a085]'
                        : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {/* Dropdowns row */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Company dropdown */}
              <div className="relative flex-1" ref={companyRef}>
                <button
                  onClick={() => setShowCompanyDD((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors hover:border-[#14a085] focus:outline-none"
                >
                  <span className={selectedCompany ? 'font-medium text-gray-900' : 'text-gray-400'}>
                    {selectedCompany || 'Select Company'}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-gray-400 transition-transform ${showCompanyDD ? 'rotate-90' : ''}`}
                  />
                </button>
                {showCompanyDD && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="p-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        <input
                          value={companyQuery}
                          onChange={(e) => setCompanyQuery(e.target.value)}
                          placeholder="Search company…"
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto pb-2">
                      {selectedCompany && (
                        <li>
                          <button
                            onClick={() => {
                              setSelectedCompany('');
                              setShowCompanyDD(false);
                              setCompanyQuery('');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                          >
                            Clear selection
                          </button>
                        </li>
                      )}
                      {filteredCompanies.map((c) => (
                        <li key={c}>
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setShowCompanyDD(false);
                              setCompanyQuery('');
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                              selectedCompany === c
                                ? 'font-semibold text-[#14a085]'
                                : 'text-gray-700'
                            }`}
                          >
                            {c}
                          </button>
                        </li>
                      ))}
                      {filteredCompanies.length === 0 && (
                        <li className="px-4 py-2 text-sm text-gray-400">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Role dropdown */}
              <div className="relative flex-1" ref={roleRef}>
                <button
                  onClick={() => setShowRoleDD((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors hover:border-[#14a085] focus:outline-none"
                >
                  <span className={selectedRole ? 'font-medium text-gray-900' : 'text-gray-400'}>
                    {selectedRole || 'Select Role'}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 text-gray-400 transition-transform ${showRoleDD ? 'rotate-90' : ''}`}
                  />
                </button>
                {showRoleDD && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="p-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        <input
                          value={roleQuery}
                          onChange={(e) => setRoleQuery(e.target.value)}
                          placeholder="Search role…"
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto pb-2">
                      {selectedRole && (
                        <li>
                          <button
                            onClick={() => {
                              setSelectedRole('');
                              setShowRoleDD(false);
                              setRoleQuery('');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                          >
                            Clear selection
                          </button>
                        </li>
                      )}
                      {filteredRoles.map((r) => (
                        <li key={r}>
                          <button
                            onClick={() => {
                              setSelectedRole(r);
                              setShowRoleDD(false);
                              setRoleQuery('');
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                              selectedRole === r
                                ? 'font-semibold text-[#14a085]'
                                : 'text-gray-700'
                            }`}
                          >
                            {r}
                          </button>
                        </li>
                      ))}
                      {filteredRoles.length === 0 && (
                        <li className="px-4 py-2 text-sm text-gray-400">No results</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Category pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    activeCategory === cat
                      ? 'border-[#14a085] bg-[#14a085] text-white'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-[#14a085] hover:text-[#14a085]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cards Grid ───────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {hasFilters ? (
            /* Flat filtered results */
            <div>
              {(() => {
                const results = getFilteredFlat();
                return results.length === 0 ? (
                  <div className="rounded-xl bg-white py-16 text-center shadow-sm">
                    <p className="text-gray-500">No prep sessions found for the selected filters.</p>
                    <button
                      onClick={() => {
                        setSelectedCompany('');
                        setSelectedRole('');
                      }}
                      className="mt-3 text-sm font-medium text-[#14a085] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-gray-400">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {results.map((card) => (
                        <PrepCard key={card.slug} card={card} />
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            /* Sectioned view */
            SECTIONS.map((section) => {
              const cards = getCardsForSection(section);
              if (cards.length === 0) return null;
              return (
                <div key={section}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      {SECTION_LABELS[section]}
                    </h2>
                    <button className="text-sm font-medium text-[#14a085] hover:underline">
                      View All →
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-3">
                    {cards.map((card) => (
                      <div key={card.slug} className="w-56 shrink-0 sm:w-60">
                        <PrepCard card={card} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function PrepCard({ card }: { card: PrepEntry }) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white ${card.logoColor}`}
      >
        {card.logoInitial}
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">
        {card.role}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">
        {card.company} — {card.prepCount} Preps
      </p>
      <p className="mt-1 text-xs text-gray-400">Salary {card.salaryRange}</p>
      <Link
        href={`/job-prep/${card.slug}`}
        className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#14a085] hover:underline"
      >
        Start Prep
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
