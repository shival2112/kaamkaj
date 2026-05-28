import Link from 'next/link';
import {
  TrendingUp,
  Truck,
  Code,
  Phone,
  DollarSign,
  BookOpen,
  Heart,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    name: 'Sales & Marketing',
    slug: 'sales',
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600',
    jobs: '1.2 Lakh+',
  },
  {
    name: 'Delivery & Logistics',
    slug: 'delivery',
    icon: Truck,
    color: 'bg-orange-50 text-orange-600',
    jobs: '85 Thousand+',
  },
  {
    name: 'Tech & Software',
    slug: 'tech',
    icon: Code,
    color: 'bg-violet-50 text-violet-600',
    jobs: '2.5 Lakh+',
  },
  {
    name: 'BPO / Call Centre',
    slug: 'bpo',
    icon: Phone,
    color: 'bg-green-50 text-green-600',
    jobs: '60 Thousand+',
  },
  {
    name: 'Finance & Accounts',
    slug: 'finance',
    icon: DollarSign,
    color: 'bg-yellow-50 text-yellow-700',
    jobs: '45 Thousand+',
  },
  {
    name: 'Teaching & Training',
    slug: 'teaching',
    icon: BookOpen,
    color: 'bg-red-50 text-red-600',
    jobs: '30 Thousand+',
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: Heart,
    color: 'bg-pink-50 text-pink-600',
    jobs: '55 Thousand+',
  },
  {
    name: 'Marketing & PR',
    slug: 'marketing',
    icon: Megaphone,
    color: 'bg-indigo-50 text-indigo-600',
    jobs: '40 Thousand+',
  },
] as const;

export function CategoryGrid() {
  return (
    <section className="bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Browse Popular Categories
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find jobs that match your skills and interests
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map(({ name, slug, icon: Icon, color, jobs }) => (
            <Link
              key={slug}
              href={`/jobs?category=${slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-white p-5 text-center transition-all duration-150 hover:border-primary/40 hover:shadow-md"
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-110',
                  color
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{jobs} Jobs</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
