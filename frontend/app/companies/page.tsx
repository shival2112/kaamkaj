import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Building2, BadgeCheck, Users, Briefcase } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';
import { CompanyFilters } from '@/components/companies/CompanyFilters';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Companies Hiring in India | KaamKaaj',
  description: 'Explore top companies hiring across India. Filter by industry, company size, and more.',
  openGraph: {
    title: 'Companies Hiring in India | KaamKaaj',
    description: 'Explore top companies hiring across India.',
    type: 'website',
    siteName: 'KaamKaaj',
  },
  twitter: {
    card: 'summary',
    title: 'Companies Hiring in India | KaamKaaj',
    description: 'Explore top companies hiring across India.',
  },
};

const PAGE_SIZE = 12;

const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function tileColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

interface PageProps {
  searchParams: {
    q?: string; industry?: string; size?: string; page?: string;
  };
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const q        = searchParams.q?.trim()        || undefined;
  const industry = searchParams.industry?.trim() || undefined;
  const size     = searchParams.size?.trim()     || undefined;
  const page     = Math.max(1, Number(searchParams.page || 1));

  const where = {
    ...(q        && { name:     { contains: q,        mode: 'insensitive' as const } }),
    ...(industry && { industry: { contains: industry, mode: 'insensitive' as const } }),
    ...(size     && { size }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: { select: { jobs: { where: { status: JobStatus.ACTIVE } } } },
      },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Explore Companies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString()} compan{total !== 1 ? 'ies' : 'y'} hiring
            {q ? ` matching "${q}"` : ''}
          </p>

          {/* Search bar */}
          <form method="GET" action="/companies" className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Company name or industry"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Filter sidebar */}
          <CompanyFilters />

          {/* Company cards */}
          <div className="flex-1 min-w-0">
            {companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-medium text-foreground">No companies found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search term</p>
                <Link href="/companies" className="mt-4 text-sm font-medium text-primary hover:underline">
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {companies.map((company) => {
                    const color = tileColor(company.name);
                    const activeJobs = company._count.jobs;
                    return (
                      <Link
                        key={company.id}
                        href={`/companies/${company.id}`}
                        className="group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"
                      >
                        {/* Logo tile + verified */}
                        <div className="flex items-start justify-between gap-3">
                          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white', color)}>
                            {company.name[0].toUpperCase()}
                          </div>
                          {company.isVerified && (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          )}
                        </div>

                        {/* Name + industry */}
                        <h3 className="mt-3 font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{company.industry}</p>
                        )}

                        {/* Description preview */}
                        {company.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {company.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {company.size && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {company.size}
                              </span>
                            )}
                          </div>
                          <span className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            activeJobs > 0
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary text-muted-foreground',
                          )}>
                            <Briefcase className="mr-1 inline h-3 w-3" />
                            {activeJobs} open {activeJobs === 1 ? 'job' : 'jobs'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
