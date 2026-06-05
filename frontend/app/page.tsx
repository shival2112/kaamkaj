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
  abbr: string;
  fullName: string;
  desc: string;
  bg: string;
  text: string;
}

const COMPANIES: CompanyItem[] = [
  { abbr: 'PT', fullName: 'Paytm Service Pvt. Ltd.', desc: 'Digital payment and e-commerce facilitator.', bg: 'bg-blue-50', text: 'text-blue-600' },
  { abbr: 'ZO', fullName: 'Zomato', desc: 'Online food delivery marketplace.', bg: 'bg-red-50', text: 'text-red-600' },
  { abbr: 'SW', fullName: 'Swiggy', desc: 'Food delivery and online ordering platform.', bg: 'bg-orange-50', text: 'text-orange-600' },
  { abbr: 'KL', fullName: 'Kotak Life Insurance', desc: 'Life insurance and financial services company.', bg: 'bg-red-50', text: 'text-red-700' },
  { abbr: 'HD', fullName: 'HDFC Bank', desc: 'Leading private sector bank in India.', bg: 'bg-blue-50', text: 'text-blue-800' },
  { abbr: 'FK', fullName: 'Flipkart', desc: "India's leading e-commerce marketplace.", bg: 'bg-blue-50', text: 'text-blue-500' },
  { abbr: 'TM', fullName: 'Tech Mahindra', desc: 'IT services and consulting company.', bg: 'bg-violet-50', text: 'text-violet-600' },
  { abbr: 'ZP', fullName: 'Zepto', desc: 'Quick commerce delivery platform.', bg: 'bg-yellow-50', text: 'text-yellow-700' },
];

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

function HeroCollage() {
  return (
    <div className="relative hidden lg:flex items-center justify-center py-6">
      <div className="pointer-events-none absolute -top-16 right-4 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-4 h-56 w-56 rounded-full bg-pink-200/30 blur-3xl" />

      <div className="relative grid grid-cols-2 gap-3 w-full max-w-md">
        {/* Featured job card */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-700 font-bold text-sm">TM</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Software Engineer</p>
                <p className="text-xs text-gray-500">Tech Mahindra · Bangalore</p>
              </div>
            </div>
            <span className="text-xs text-[#007a5a] font-semibold bg-green-50 px-2.5 py-1 rounded-full shrink-0">
              Active
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">₹6–10 LPA</span>
            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">Full-time</span>
            <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">3–5 yrs exp</span>
          </div>
        </div>

        {/* Hired card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-orange-700 font-bold text-sm">RS</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-xs truncate">Rahul S.</p>
              <p className="text-[10px] text-gray-500">Sales Executive</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007a5a] bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
              ✓ Hired at Bajaj!
            </span>
          </div>
        </div>

        {/* Stats card */}
        <div
          className="rounded-2xl shadow-md border border-green-100 p-4"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
        >
          <p className="text-2xl font-extrabold text-[#007a5a]">50L+</p>
          <p className="text-xs text-gray-600 mt-0.5">Live opportunities</p>
          <div className="mt-3 flex -space-x-2">
            {(['#f97316', '#8b5cf6', '#3b82f6', '#ec4899'] as const).map((color, i) => (
              <div
                key={color}
                className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] text-gray-500 shrink-0">
              +99
            </div>
          </div>
        </div>

        {/* Companies row */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-2.5">
            Top companies hiring now
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {(['Flipkart', 'Bajaj', 'Teleperformance', 'HDFC', 'TCS'] as const).map((c) => (
              <span key={c} className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── 1. Hero ── */}
      <section
        className="px-4 pb-14 pt-12 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #f7f5ff 0%, #fdf0f8 100%)' }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Heading row: left text + right collage */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
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
            </div>
            <HeroCollage />
          </div>

          {/* Search bar — constrained to 3xl so inputs don't show large empty gaps */}
          <div className="mt-8 max-w-3xl">
            <ApnaSearchBar />
          </div>

          {/* Logos row */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 shrink-0">
                Proud to Support
              </span>
              {GOVT_LOGOS.map(({ abbr, name, bg, text }) => (
                <div
                  key={name}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm"
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {ENTERPRISE_LOGOS.map(({ name, color }) => (
                  <span key={name} className={`text-sm font-bold ${color} tracking-tight`}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Popular Searches ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">

            {/* Left heading */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-[#1a1a1a] leading-tight">
                Popular<br />Searches on<br />KaamKaaj
              </h2>
            </div>

            {/* Right: card grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Top row — 2 cards */}
              <div className="grid grid-cols-2 gap-4">
                {POPULAR_SEARCHES.slice(0, 2).map(({ rank, label, Icon, iconColor, accent }) => (
                  <div
                    key={rank}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Trending at #{rank}
                    </p>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-8 leading-snug">{label}</h3>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(label)}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#007a5a] hover:underline"
                    >
                      View all <ChevronRight className="h-4 w-4" />
                    </Link>
                    <div
                      className="absolute bottom-0 right-0 h-28 w-28 rounded-tl-[3rem] flex items-center justify-center"
                      style={{ background: accent }}
                    >
                      <Icon className={`h-14 w-14 ${iconColor} opacity-50`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row — 3 cards */}
              <div className="grid grid-cols-3 gap-4">
                {POPULAR_SEARCHES.slice(2).map(({ rank, label, Icon, iconColor, accent }) => (
                  <div
                    key={rank}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Trending at #{rank}
                    </p>
                    <h3 className="text-sm font-bold text-[#1a1a1a] mb-6 leading-snug">{label}</h3>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(label)}`}
                      className="flex items-center gap-1 text-xs font-semibold text-[#007a5a] hover:underline"
                    >
                      View all <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <div
                      className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-[2rem] flex items-center justify-center"
                      style={{ background: accent }}
                    >
                      <Icon className={`h-10 w-10 ${iconColor} opacity-50`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Job Openings in Top Companies ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: '#f5f4ff' }}>
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-10">
            Job Openings in Top companies
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {COMPANIES.map(({ abbr, fullName, desc, bg, text }) => (
              <div
                key={abbr}
                className="flex-none w-64 bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <span className={`font-bold text-sm ${text}`}>{abbr}</span>
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{fullName}</p>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">{desc}</p>
                <Link
                  href="/jobs"
                  className="flex items-center gap-1 text-sm font-semibold text-[#007a5a] hover:underline"
                >
                  View jobs <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-2 mt-5">
            <div className="h-2 w-6 rounded-full bg-[#007a5a]" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#007a5a] px-8 py-3 text-sm font-semibold text-[#007a5a] hover:bg-[#007a5a]/5 transition-colors"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Trending Job Roles ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center text-[#1a1a1a] mb-10">
            Trending job roles on KaamKaaj
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRENDING_ROLES.map(({ role, openings, Icon }) => (
              <Link
                key={role}
                href={`/jobs?q=${encodeURIComponent(role)}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-[#007a5a]/40 hover:bg-green-50/30 hover:shadow-sm transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                  <Icon className="h-4 w-4 text-gray-500 group-hover:text-[#007a5a] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{role}</p>
                  <p className="text-[10px] text-gray-400">{openings} openings</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#007a5a] px-8 py-3 text-sm font-semibold text-[#007a5a] hover:bg-[#007a5a]/5 transition-colors"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Testimonials ── */}
      <section className="overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[280px]">

          {/* Dark green left panel */}
          <div className="flex flex-col justify-center bg-[#007a5a] px-8 py-12 lg:w-[340px] lg:shrink-0 lg:px-10">
            <Quote className="h-10 w-10 text-white/25 mb-5" />
            <h2 className="text-2xl font-bold text-white leading-snug mb-6">
              Join the community of 5 crore satisfied job seekers...
            </h2>
            <div>
              <p className="text-sm text-white/60 mb-2">Play Store Ratings</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable testimonial cards */}
          <div className="flex-1 bg-[#e6f4f0] px-6 py-10 lg:px-10 flex items-center">
            <div className="flex gap-4 overflow-x-auto pb-2 w-full">
              {TESTIMONIALS.map(({ name, initials, rating, review, avatarBg }) => (
                <div key={name} className="flex-none w-72 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`h-11 w-11 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
                        <span className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold text-[#007a5a] border border-[#007a5a]/40 px-1.5 py-0.5 rounded">
                          ✓ PLACED
                        </span>
                      </div>
                      <StarRating rating={rating} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Download App CTA ── */}
      <section
        className="px-4 py-16 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(135deg, #ede9ff 0%, #f3efff 50%, #fce7f3 100%)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">

            {/* Left: text + badges + stats */}
            <div>
              <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">
                Download KaamKaaj app!
              </h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Unlimited job applications | HRs contact you directly | Track your Applications
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white rounded-xl px-5 py-3 hover:bg-gray-800 transition-colors"
                >
                  <Smartphone className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-[9px] leading-none opacity-60">Download on the</p>
                    <p className="text-sm font-bold leading-tight">App Store</p>
                  </div>
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-3 bg-[#1a1a1a] text-white rounded-xl px-5 py-3 hover:bg-gray-800 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-[9px] leading-none opacity-60">Get it on</p>
                    <p className="text-sm font-bold leading-tight">Google Play</p>
                  </div>
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#007a5a]">4.7</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Rating</p>
                </div>
                <div className="h-10 w-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1a1a1a]">7L+</p>
                  <p className="text-xs text-gray-500 mt-1">Reviews</p>
                </div>
                <div className="h-10 w-px bg-gray-300" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1a1a1a]">5cr+</p>
                  <p className="text-xs text-gray-500 mt-1">Downloads</p>
                </div>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-44 h-[22rem] bg-[#111] rounded-[3rem] border-[5px] border-[#2a2a2a] shadow-2xl flex flex-col overflow-hidden">
                  {/* Notch */}
                  <div className="h-7 bg-[#111] flex justify-center items-end pb-1.5 shrink-0">
                    <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full" />
                  </div>
                  {/* Screen */}
                  <div
                    className="flex-1 flex flex-col p-3 gap-2 overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #f7f5ff, #ffffff)' }}
                  >
                    <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                      <p className="text-[8px] text-gray-400">Search jobs by title...</p>
                    </div>
                    {[
                      { abbr: 'FK', label: 'Delivery Partner', loc: 'Mumbai', bg: 'bg-blue-100', t: 'text-blue-600' },
                      { abbr: 'ZO', label: 'Customer Support', loc: 'Delhi', bg: 'bg-red-100', t: 'text-red-600' },
                      { abbr: 'TM', label: 'Software Dev', loc: 'Bangalore', bg: 'bg-violet-100', t: 'text-violet-600' },
                    ].map(({ abbr, label, loc, bg, t }) => (
                      <div key={abbr} className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-5 w-5 rounded ${bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[7px] font-bold ${t}`}>{abbr}</span>
                          </div>
                          <div>
                            <p className="text-[8px] font-semibold text-gray-800 leading-tight">{label}</p>
                            <p className="text-[7px] text-gray-400">{loc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rating badge */}
                <div className="absolute -right-8 top-12 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-center">
                  <p className="text-base font-bold text-[#007a5a]">4.7 ★</p>
                  <p className="text-[9px] text-gray-500">7L reviews</p>
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
