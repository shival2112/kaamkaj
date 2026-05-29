import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, Code2, Truck, Headphones } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { HeroSearch } from '@/components/homepage/HeroSearch';

export const metadata: Metadata = {
  title: "KaamKaaj — Find Your Dream Job in India",
  description:
    '5 Crore+ jobs across 500+ cities. Free to apply. Verified employers only.',
};

const QUICK_CHIPS = [
  'Delivery Jobs',
  'Work from Home',
  'Freshers',
  '12th Pass',
  'Part-time',
] as const;

const STATS = [
  { value: '5 Crore+', label: 'Job Seekers' },
  { value: '10 Lakh+', label: 'Verified Employers' },
  { value: '50 Lakh+', label: 'Jobs Posted' },
  { value: '500+', label: 'Cities Covered' },
] as const;

const CATEGORIES = [
  {
    name: 'Sales',
    jobs: '12,450 jobs',
    Icon: TrendingUp,
    color: 'bg-orange-50 text-orange-500',
  },
  {
    name: 'Tech',
    jobs: '8,920 jobs',
    Icon: Code2,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    name: 'Delivery',
    jobs: '24,100 jobs',
    Icon: Truck,
    color: 'bg-green-50 text-green-500',
  },
  {
    name: 'BPO',
    jobs: '6,310 jobs',
    Icon: Headphones,
    color: 'bg-violet-50 text-violet-500',
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Dream Job in India
          </h1>
          <p className="mt-4 text-lg text-violet-100 sm:text-xl">
            5 Crore+ jobs across 500+ cities.{' '}
            <span className="font-semibold text-white">Free to apply.</span>{' '}
            Verified employers only.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <HeroSearch />
          </div>

          {/* Quick-search chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-violet-200">Popular:</span>
            {QUICK_CHIPS.map((chip) => (
              <Link
                key={chip}
                href={`/jobs?q=${encodeURIComponent(chip)}`}
                className="rounded-full bg-white/10 px-3.5 py-1 text-sm text-white transition-colors hover:bg-white/25"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* gap-px + bg-border gives hairline separators between cells */}
          <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white px-6 py-10 text-center">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Browse by Category ─── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore thousands of jobs across popular industries
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map(({ name, jobs, Icon, color }) => (
              <Link
                key={name}
                href={`/jobs?category=${encodeURIComponent(name.toLowerCase())}`}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                    {name}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-primary">{jobs}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
