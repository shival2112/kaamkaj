import type { Metadata } from 'next';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap, Laptop, Clock, Users, Briefcase,
  Archive, Car, BarChart3, Monitor, Utensils, Scissors,
  Dumbbell, Stethoscope, FileText, Sparkles,
  ChevronRight, Star, Smartphone, Download, Quote,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { ApnaSearchBar } from '@/components/homepage/ApnaSearchBar';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'KaamKaaj — Find Your Dream Job in India',
  description: "Discover 50 lakh+ career opportunities across all industries. India's fastest-growing job platform.",
  openGraph: {
    title: 'KaamKaaj — Find Your Dream Job in India',
    description: "Discover 50 lakh+ career opportunities. India's fastest-growing job platform.",
    type: 'website',
    siteName: 'KaamKaaj',
  },
  twitter: {
    card: 'summary',
    title: 'KaamKaaj — Find Your Dream Job in India',
    description: "Discover 50 lakh+ career opportunities across all industries.",
  },
};

// ─── Data ───────────────────────────────────────────────────────────────────

const GOVT_LOGOS = [
  { abbr: 'GOI', name: 'Ministry of Labour', bg: 'bg-blue-900', text: 'text-white' },
  { abbr: 'AI', name: 'Startup India', bg: 'bg-orange-500', text: 'text-white' },
  { abbr: 'DP', name: 'DPIIT #Startupindia', bg: 'bg-blue-600', text: 'text-white' },
] as const;

const ENTERPRISE_LOGOS = [
  { name: 'Shoppers Stop', color: 'text-gray-900' },
  { name: 'Tech Mahindra', color: 'text-red-700' },
  { name: 'Teleperformance', color: 'text-violet-700' },
  { name: 'Bajaj Allianz', color: 'text-blue-800' },
  { name: 'Flipkart', color: 'text-blue-600' },
] as const;

interface SearchItem {
  rank: number;
  label: string;
  Icon: LucideIcon;
  iconColor: string;
  accent: string;
}

const POPULAR_SEARCHES: SearchItem[] = [
  { rank: 1, label: 'Jobs for Freshers', Icon: GraduationCap, iconColor: 'text-orange-400', accent: '#FFF7ED' },
  { rank: 2, label: 'Work from home Jobs', Icon: Laptop, iconColor: 'text-blue-400', accent: '#EFF6FF' },
  { rank: 3, label: 'Part time Jobs', Icon: Clock, iconColor: 'text-purple-400', accent: '#F5F3FF' },
  { rank: 4, label: 'Jobs for Women', Icon: Users, iconColor: 'text-pink-400', accent: '#FDF2F8' },
  { rank: 5, label: 'Full time Jobs', Icon: Briefcase, iconColor: 'text-green-500', accent: '#F0FDF4' },
];

interface CompanyItem {
  id: string;
  abbr: string;
  fullName: string;
  desc: string;
  bg: string;
  text: string;
}

const CARD_PALETTE = [
  { bg: 'bg-blue-50',   text: 'text-blue-600' },
  { bg: 'bg-red-50',    text: 'text-red-600' },
  { bg: 'bg-orange-50', text: 'text-orange-600' },
  { bg: 'bg-violet-50', text: 'text-violet-600' },
  { bg: 'bg-green-50',  text: 'text-green-700' },
  { bg: 'bg-yellow-50', text: 'text-yellow-700' },
] as const;

const COMPANY_STOPWORDS = new Set(['company', 'pvt', 'ltd', 'limited', 'services', 'service', 'india', 'the', 'of', 'and', 'llp', 'inc']);

// Derives short, collision-safe initials (e.g. "Prakash Software's Company" → "PS") for companies
// that don't have a logo uploaded yet, so the card grid always has something to show.
function companyInitials(name: string, used: Set<string>): string {
  const tokens = name
    .replace(/['’]s\b/gi, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !COMPANY_STOPWORDS.has(t.toLowerCase()));

  const base = tokens.length >= 2
    ? (tokens[0][0] + tokens[1][0]).toUpperCase()
    : (tokens[0] ?? name).slice(0, 2).toUpperCase();

  if (!used.has(base)) { used.add(base); return base; }

  const digitMatch = name.match(/\d/);
  if (digitMatch) {
    const alt = (tokens[0]?.[0] ?? base[0]).toUpperCase() + digitMatch[0];
    if (!used.has(alt)) { used.add(alt); return alt; }
  }
  if (tokens.length >= 3) {
    const alt = (tokens[0][0] + tokens[2][0]).toUpperCase();
    if (!used.has(alt)) { used.add(alt); return alt; }
  }
  let n = 1;
  let alt = base;
  while (used.has(alt)) { alt = base[0] + String(n); n++; }
  used.add(alt);
  return alt;
}

async function getTopCompanies(): Promise<CompanyItem[]> {
  const companies = await prisma.company.findMany({
    select: {
      id: true, name: true, description: true, industry: true,
      jobs: { where: { status: JobStatus.ACTIVE }, select: { id: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const usedAbbrs = new Set<string>();
  return companies.map((c, i) => ({
    id: c.id,
    abbr: companyInitials(c.name, usedAbbrs),
    fullName: c.name,
    desc: c.description ?? c.industry ?? `${c.jobs.length} open position${c.jobs.length === 1 ? '' : 's'}`,
    bg: CARD_PALETTE[i % CARD_PALETTE.length].bg,
    text: CARD_PALETTE[i % CARD_PALETTE.length].text,
  }));
}

interface RoleItem {
  role: string;
  openings: number;
  Icon: LucideIcon;
}

const TRENDING_ROLES: RoleItem[] = [
  { role: 'Back Office', openings: 936, Icon: Archive },
  { role: 'Driver', openings: 755, Icon: Car },
  { role: 'Business Operations', openings: 688, Icon: BarChart3 },
  { role: 'Digital / Online Marketing', openings: 639, Icon: Monitor },
  { role: 'Human Resource', openings: 637, Icon: Users },
  { role: 'Cook / Chef / Baker', openings: 597, Icon: Utensils },
  { role: 'Fitness Trainer / Dietician', openings: 74, Icon: Dumbbell },
  { role: 'Medical Executive / Assistant', openings: 69, Icon: Stethoscope },
  { role: 'Doctor / Dentist', openings: 53, Icon: Stethoscope },
  { role: 'Content Writing', openings: 44, Icon: FileText },
  { role: 'Tailor / Cutting Master', openings: 44, Icon: Scissors },
  { role: 'Fashion Designer', openings: 42, Icon: Sparkles },
];

interface TestimonialItem {
  name: string;
  initials: string;
  rating: number;
  review: string;
  avatarBg: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: 'Shiwangi Singla',
    initials: 'SS',
    rating: 4.5,
    review: 'Thanks KaamKaaj for helping me find a job without much hassle. If you are a fresher or a skilled person, you can easily find a job through this platform.',
    avatarBg: 'bg-pink-400',
  },
  {
    name: 'Jenil Ghevariya',
    initials: 'JG',
    rating: 4.5,
    review: 'This app is very helpful if you are looking for a job. The team is supportive and friendly. I got a job interview call very quickly after applying.',
    avatarBg: 'bg-blue-500',
  },
  {
    name: 'Kaynat Mansuri',
    initials: 'KM',
    rating: 4.5,
    review: 'It is definitely a great app with helpful information on the job details. I would also recommend my friends to use KaamKaaj for career development.',
    avatarBg: 'bg-violet-500',
  },
  {
    name: 'Amit Sharma',
    initials: 'AS',
    rating: 5,
    review: 'Found my dream job within 2 weeks. The job matching is excellent and the application process is completely seamless. Highly recommend!',
    avatarBg: 'bg-orange-500',
  },
];

// ─── Sub-components (server-only, no client state) ──────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : s - 0.5 <= rating
              ? 'fill-yellow-200 text-yellow-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] font-medium text-gray-500">{rating}</span>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative hidden lg:flex items-center justify-center py-4">
      <svg
        viewBox="0 0 460 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg h-auto"
        aria-hidden="true"
      >
        <defs>
          <filter id="kk-shadow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.10"/>
          </filter>
          <linearGradient id="kk-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede9ff"/>
            <stop offset="100%" stopColor="#fce7f3"/>
          </linearGradient>
          <linearGradient id="kk-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d6de0"/>
            <stop offset="100%" stopColor="#4b4bc2"/>
          </linearGradient>
        </defs>

        {/* ── Background blob ── */}
        <ellipse cx="238" cy="282" rx="182" ry="192" fill="url(#kk-bg)"/>
        <circle cx="80"  cy="115" r="26" fill="#ddd6fe" opacity="0.55"/>
        <circle cx="400" cy="405" r="36" fill="#fde8ef" opacity="0.55"/>
        <circle cx="62"  cy="398" r="20" fill="#bbf7d0" opacity="0.65"/>

        {/* ── Person ── */}

        {/* Left arm (hanging down) */}
        <path
          d="M150 245 C136 256 126 305 122 358 Q120 368 130 370 L146 371 Q156 372 158 362 L160 290 L162 252"
          fill="url(#kk-shirt)"
        />
        {/* Left hand */}
        <ellipse cx="134" cy="374" rx="16" ry="13" fill="#f4a26b"/>
        <path d="M122 374 C118 384 120 392 134 392 C148 392 150 384 147 374" fill="#f4a26b"/>

        {/* Shirt body */}
        <path
          d="M163 222 C150 232 140 258 138 290 L135 435 Q135 445 145 445 L303 445 Q313 445 313 435 L310 290 C308 258 298 232 285 222 Z"
          fill="url(#kk-shirt)"
        />

        {/* Collar V */}
        <path d="M200 222 L224 254 L248 222" stroke="#3b3ba8" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
        {/* Button line */}
        <line x1="224" y1="254" x2="224" y2="443" stroke="#3b3ba8" strokeWidth="1.5" opacity="0.4"/>

        {/* Right arm (extended toward phone) */}
        <path
          d="M298 248 C308 255 326 268 338 282 L342 322 Q343 332 333 334 L319 335 Q309 336 308 326 L306 285 L296 265"
          fill="url(#kk-shirt)"
        />
        {/* Right hand */}
        <ellipse cx="336" cy="336" rx="15" ry="12" fill="#f4a26b"/>
        <path d="M325 336 C322 346 324 354 336 354 C348 354 350 346 347 336" fill="#f4a26b"/>

        {/* Neck */}
        <rect x="207" y="188" width="36" height="44" rx="10" fill="#f4a26b"/>

        {/* Head */}
        <circle cx="225" cy="130" r="62" fill="#f4a26b"/>

        {/* Hair */}
        <path
          d="M163 122 Q167 62 225 58 Q283 58 290 118 L284 100 Q268 66 225 64 Q182 66 170 104 Z"
          fill="#1e0e06"
        />
        <path d="M163 122 L159 150 Q156 138 156 122 Q158 110 169 104 Z" fill="#1e0e06"/>
        <path d="M289 118 L293 146 Q296 134 296 118 Q295 106 285 100 Z" fill="#1e0e06"/>

        {/* Ears */}
        <ellipse cx="163" cy="134" rx="11" ry="14" fill="#f4a26b"/>
        <ellipse cx="287" cy="134" rx="11" ry="14" fill="#f4a26b"/>
        {/* Inner ear */}
        <ellipse cx="163" cy="134" rx="6" ry="9" fill="#e8936a"/>
        <ellipse cx="287" cy="134" rx="6" ry="9" fill="#e8936a"/>

        {/* Eyebrows */}
        <path d="M198 111 Q210 104 222 109" stroke="#1e0e06" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M228 109 Q240 104 252 111" stroke="#1e0e06" strokeWidth="3" strokeLinecap="round" fill="none"/>

        {/* Eyes — whites */}
        <ellipse cx="209" cy="126" rx="10" ry="11" fill="white"/>
        <ellipse cx="241" cy="126" rx="10" ry="11" fill="white"/>
        {/* Irises */}
        <circle cx="210" cy="127" r="6.5" fill="#2c1810"/>
        <circle cx="242" cy="127" r="6.5" fill="#2c1810"/>
        {/* Shine dots */}
        <circle cx="212" cy="125" r="2.5" fill="white"/>
        <circle cx="244" cy="125" r="2.5" fill="white"/>

        {/* Nose */}
        <path d="M221 143 Q225 155 229 143" stroke="#d4845a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

        {/* Smile */}
        <path d="M207 160 Q225 175 243 160" stroke="#1e0e06" strokeWidth="2.8" strokeLinecap="round" fill="none"/>

        {/* ── Phone ── */}
        {/* Phone body */}
        <rect x="293" y="195" width="90" height="162" rx="14" fill="#0f172a" filter="url(#kk-shadow)"/>
        {/* Bezels/screen */}
        <rect x="298" y="202" width="80" height="148" rx="9" fill="white"/>

        {/* Status / app bar */}
        <rect x="298" y="202" width="80" height="21" rx="9" fill="#5B5BD6"/>
        <text x="338" y="216" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="white" textAnchor="middle" fontWeight="700">KaamKaaj</text>

        {/* Home bar */}
        <rect x="319" y="342" width="38" height="4" rx="2" fill="#0f172a" opacity="0.2"/>

        {/* Job card 1 */}
        <rect x="302" y="227" width="72" height="28" rx="6" fill="#f5f3ff"/>
        <rect x="306" y="233" width="18" height="16" rx="4" fill="#ddd6fe"/>
        <text x="308" y="243" fontFamily="system-ui,sans-serif" fontSize="6" fill="#5B5BD6" fontWeight="700">TM</text>
        <text x="329" y="237" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="#111" fontWeight="600">Software Eng.</text>
        <text x="329" y="248" fontFamily="system-ui,sans-serif" fontSize="5.5" fill="#888">₹8–12 LPA · Blr</text>

        {/* Job card 2 */}
        <rect x="302" y="259" width="72" height="28" rx="6" fill="#fef2f2"/>
        <rect x="306" y="265" width="18" height="16" rx="4" fill="#fecaca"/>
        <text x="308" y="275" fontFamily="system-ui,sans-serif" fontSize="6" fill="#dc2626" fontWeight="700">ZO</text>
        <text x="329" y="269" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="#111" fontWeight="600">BDE Manager</text>
        <text x="329" y="280" fontFamily="system-ui,sans-serif" fontSize="5.5" fill="#888">₹6–9 LPA · Delhi</text>

        {/* Job card 3 */}
        <rect x="302" y="291" width="72" height="28" rx="6" fill="#f0fdf4"/>
        <rect x="306" y="297" width="18" height="16" rx="4" fill="#bbf7d0"/>
        <text x="308" y="307" fontFamily="system-ui,sans-serif" fontSize="6" fill="#007a5a" fontWeight="700">FK</text>
        <text x="329" y="301" fontFamily="system-ui,sans-serif" fontSize="6.5" fill="#111" fontWeight="600">Prod. Manager</text>
        <text x="329" y="312" fontFamily="system-ui,sans-serif" fontSize="5.5" fill="#888">Remote · ₹12 LPA</text>

        {/* Apply button in phone */}
        <rect x="306" y="325" width="64" height="16" rx="8" fill="#007a5a"/>
        <text x="338" y="336" fontFamily="system-ui,sans-serif" fontSize="7" fill="white" textAnchor="middle" fontWeight="600">Apply Now</text>

        {/* ── Floating badges ── */}

        {/* 50L+ Live Jobs — top-left */}
        <g transform="translate(36, 150)">
          <rect width="114" height="50" rx="16" fill="#5B5BD6"/>
          <text x="57" y="23" fontFamily="system-ui,sans-serif" fontSize="19" fill="white" textAnchor="middle" fontWeight="800">50L+</text>
          <text x="57" y="39" fontFamily="system-ui,sans-serif" fontSize="9" fill="rgba(255,255,255,0.88)" textAnchor="middle">Live Opportunities</text>
        </g>

        {/* Got Hired! — left mid */}
        <g transform="translate(28, 300)" filter="url(#kk-shadow)">
          <rect width="124" height="56" rx="16" fill="white"/>
          <circle cx="28" cy="28" r="20" fill="#dcfce7"/>
          <text x="28" y="33" fontFamily="system-ui,sans-serif" fontSize="16" fill="#007a5a" textAnchor="middle" fontWeight="700">&#x2713;</text>
          <text x="78" y="23" fontFamily="system-ui,sans-serif" fontSize="10" fill="#111" textAnchor="middle" fontWeight="700">Got Hired!</text>
          <text x="78" y="38" fontFamily="system-ui,sans-serif" fontSize="8" fill="#666" textAnchor="middle">at Bajaj Allianz</text>
        </g>

        {/* Avg Package — top-right (above phone) */}
        <g transform="translate(338, 108)" filter="url(#kk-shadow)">
          <rect width="112" height="54" rx="16" fill="white"/>
          <text x="56" y="22" fontFamily="system-ui,sans-serif" fontSize="8.5" fill="#888" textAnchor="middle">Avg Package</text>
          <text x="56" y="42" fontFamily="system-ui,sans-serif" fontSize="16" fill="#5B5BD6" textAnchor="middle" fontWeight="800">&#x20B9;8–15 LPA</text>
        </g>

      </svg>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const companies = await getTopCompanies();
  return (
    <main className="min-h-screen bg-white">

      {/* ── 1. Hero ── */}
      <section
        className="px-4 pb-16 pt-14 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #f7f5ff 0%, #fdf0f8 100%)' }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading row: left text + right illustration */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="flex flex-col">
              <span className="inline-block text-sm font-bold uppercase tracking-widest text-[#007a5a] mb-4">
                India&apos;s #1 Job Platform
              </span>
              <h1 className="text-5xl font-bold leading-tight text-[#1a1a1a] sm:text-6xl">
                Your job search<br className="hidden sm:block" /> ends here
              </h1>
              <p className="mt-4 text-xl text-[#555]">
                Discover{' '}
                <span className="font-semibold text-[#1a1a1a]">50 lakh+</span>{' '}
                career opportunities across India
              </p>
              <div className="mt-8">
                <ApnaSearchBar />
              </div>

              {/* Logos — inside left column, matching apna.co layout */}
              <div className="mt-8 space-y-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 shrink-0">
                    Proud to Support
                  </span>
                  {GOVT_LOGOS.map(({ abbr, name, bg, text }) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
                    >
                      <div className={`h-5 w-5 rounded ${bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-[7px] font-bold ${text}`}>{abbr}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{name}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    Trusted by 1000+ enterprises and 7 lakh+ MSMEs for hiring
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {ENTERPRISE_LOGOS.map(({ name, color }) => (
                      <span key={name} className={`text-base font-bold ${color} tracking-tight`}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── 2. Popular Searches ── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">

            {/* Left heading */}
            <div className="flex flex-col justify-center">
              <h2 className="text-5xl font-bold text-[#1a1a1a] leading-tight">
                Popular<br />Searches on<br />KaamKaaj
              </h2>
            </div>

            {/* Right: card grid */}
            <div className="lg:col-span-2 space-y-5">
              {/* Top row — 2 cards */}
              <div className="grid grid-cols-2 gap-5">
                {POPULAR_SEARCHES.slice(0, 2).map(({ rank, label, Icon, iconColor, accent }) => (
                  <div
                    key={rank}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Trending at #{rank}
                    </p>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-10 leading-snug">{label}</h3>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(label)}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#007a5a] hover:underline"
                    >
                      View all <ChevronRight className="h-5 w-5" />
                    </Link>
                    <div
                      className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-[3rem] flex items-center justify-center"
                      style={{ background: accent }}
                    >
                      <Icon className={`h-16 w-16 ${iconColor} opacity-50`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row — 3 cards */}
              <div className="grid grid-cols-3 gap-5">
                {POPULAR_SEARCHES.slice(2).map(({ rank, label, Icon, iconColor, accent }) => (
                  <div
                    key={rank}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Trending at #{rank}
                    </p>
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-8 leading-snug">{label}</h3>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(label)}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#007a5a] hover:underline"
                    >
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                    <div
                      className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-[2rem] flex items-center justify-center"
                      style={{ background: accent }}
                    >
                      <Icon className={`h-12 w-12 ${iconColor} opacity-50`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Job Openings in Top Companies ── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8" style={{ background: '#f5f4ff' }}>
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center text-[#1a1a1a] mb-12">
            Job Openings in Top companies
          </h2>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {companies.map(({ id, abbr, fullName, desc, bg, text }) => (
              <div
                key={id}
                className="flex-none w-72 bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow"
              >
                <div className={`h-14 w-14 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                  <span className={`font-bold text-base ${text}`}>{abbr}</span>
                </div>
                <p className="font-bold text-gray-900 text-base mb-2">{fullName}</p>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">{desc}</p>
                <Link
                  href={`/jobs?companyId=${id}`}
                  className="flex items-center gap-1 text-sm font-semibold text-[#007a5a] hover:underline"
                >
                  View jobs <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, Math.ceil(companies.length / 4)) }).map((_, i) => (
              <div key={i} className={i === 0 ? 'h-2 w-6 rounded-full bg-[#007a5a]' : 'h-2 w-2 rounded-full bg-gray-300'} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#007a5a] px-10 py-4 text-base font-semibold text-[#007a5a] hover:bg-[#007a5a]/5 transition-colors"
            >
              View all <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Trending Job Roles ── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-center text-[#1a1a1a] mb-12">
            Trending job roles on KaamKaaj
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRENDING_ROLES.map(({ role, openings, Icon }) => (
              <Link
                key={role}
                href={`/jobs?q=${encodeURIComponent(role)}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#007a5a]/40 hover:bg-green-50/30 hover:shadow-sm transition-all group"
              >
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                  <Icon className="h-5 w-5 text-gray-500 group-hover:text-[#007a5a] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{role}</p>
                  <p className="text-xs text-gray-400">{openings} openings</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#007a5a] px-10 py-4 text-base font-semibold text-[#007a5a] hover:bg-[#007a5a]/5 transition-colors"
            >
              View all <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Testimonials ── */}
      <section className="overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[360px]">

          {/* Dark green left panel */}
          <div className="flex flex-col justify-center bg-[#007a5a] px-10 py-16 lg:w-[400px] lg:shrink-0 lg:px-14">
            <Quote className="h-12 w-12 text-white/25 mb-6" />
            <h2 className="text-3xl font-bold text-white leading-snug mb-8">
              Join the community of 5 crore satisfied job seekers...
            </h2>
            <div>
              <p className="text-sm text-white/60 mb-3">Play Store Ratings</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable testimonial cards */}
          <div className="flex-1 bg-[#e6f4f0] px-8 py-14 lg:px-12 flex items-center">
            <div className="flex gap-6 overflow-x-auto pb-2 w-full">
              {TESTIMONIALS.map(({ name, initials, rating, review, avatarBg }) => (
                <div key={name} className="flex-none w-80 bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`h-12 w-12 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-base shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-base truncate">{name}</p>
                        <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-[#007a5a] border border-[#007a5a]/40 px-1.5 py-0.5 rounded">
                          ✓ PLACED
                        </span>
                      </div>
                      <StarRating rating={rating} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Download App CTA ── */}
      <section
        className="px-4 py-24 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #ede9ff 0%, #f3efff 50%, #fce7f3 100%)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">

            {/* Left: text + badges + stats */}
            <div>
              <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">
                Download KaamKaaj app!
              </h2>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Unlimited job applications | HRs contact you directly | Track your Applications
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white rounded-xl px-6 py-4 hover:bg-gray-800 transition-colors"
                >
                  <Smartphone className="h-6 w-6" />
                  <div className="text-left">
                    <p className="text-xs leading-none opacity-60 mb-0.5">Download on the</p>
                    <p className="text-base font-bold leading-tight">App Store</p>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white rounded-xl px-6 py-4 hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-6 w-6" />
                  <div className="text-left">
                    <p className="text-xs leading-none opacity-60 mb-0.5">Get it on</p>
                    <p className="text-base font-bold leading-tight">Google Play</p>
                  </div>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#007a5a]">4.7</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Rating</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a1a1a]">7L+</p>
                  <p className="text-sm text-gray-500 mt-1">Reviews</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a1a1a]">5cr+</p>
                  <p className="text-sm text-gray-500 mt-1">Downloads</p>
                </div>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-52 h-[26rem] bg-[#111] rounded-[3rem] border-[5px] border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden">
                  {/* Notch */}
                  <div className="h-7 bg-[#111] flex justify-center items-end pb-1.5 shrink-0">
                    <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full" />
                  </div>
                  {/* Screen */}
                  <div
                    className="flex-1 flex flex-col p-4 gap-2.5 overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #f7f5ff, #ffffff)' }}
                  >
                    <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
                      <p className="text-[9px] text-gray-400">Search jobs by title...</p>
                    </div>
                    {[
                      { abbr: 'FK', label: 'Delivery Partner', loc: 'Mumbai', bg: 'bg-blue-100', t: 'text-blue-600' },
                      { abbr: 'ZO', label: 'Customer Support', loc: 'Delhi', bg: 'bg-red-100', t: 'text-red-600' },
                      { abbr: 'TM', label: 'Software Dev', loc: 'Bangalore', bg: 'bg-violet-100', t: 'text-violet-600' },
                    ].map(({ abbr, label, loc, bg, t }) => (
                      <div key={abbr} className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded ${bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[8px] font-bold ${t}`}>{abbr}</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-semibold text-gray-800 leading-tight">{label}</p>
                            <p className="text-[8px] text-gray-400">{loc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rating badge */}
                <div className="absolute -right-10 top-14 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-center">
                  <p className="text-lg font-bold text-[#007a5a]">4.7 ★</p>
                  <p className="text-xs text-gray-500">7L reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
