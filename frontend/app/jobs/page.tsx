import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, IndianRupee, Clock, Search, Briefcase } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobType, JobStatus } from '@prisma/client';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Pagination } from '@/components/ui/Pagination';
import { SaveButton } from '@/components/jobs/SaveButton';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Find Jobs in India | KaamKaaj',
  description: 'Browse 50 Lakh+ jobs across India. Filter by job type, location, and salary range.',
  openGraph: {
    title: 'Find Jobs in India | KaamKaaj',
    description: 'Browse 50 Lakh+ jobs across India. Filter by type, location, and salary.',
    type: 'website',
    siteName: 'KaamKaaj',
  },
  twitter: {
    card: 'summary',
    title: 'Find Jobs in India | KaamKaaj',
    description: 'Browse 50 Lakh+ jobs across India.',
  },
};

const PAGE_SIZE = 12;

// Deterministic company tile color from name
const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function tileColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const w = Math.floor(days / 7);
  return w === 1 ? '1 week ago' : `${w} weeks ago`;
}

function computeMatchScore(resumeSkills: string[], jobSkills: string[]): number | null {
  if (!resumeSkills.length || !jobSkills.length) return null;
  const norm = resumeSkills.map(s => s.toLowerCase().trim());
  const matched = jobSkills.filter(s => norm.some(r => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)));
  return Math.round((matched.length / jobSkills.length) * 100);
}

const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const TYPE_STYLES: Record<JobType, string> = {
  FULL_TIME:  'bg-green-50 text-green-700 border-green-200',
  PART_TIME:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  REMOTE:     'bg-blue-50 text-blue-700 border-blue-200',
  CONTRACT:   'bg-purple-50 text-purple-700 border-purple-200',
  INTERNSHIP: 'bg-orange-50 text-orange-700 border-orange-200',
};

interface PageProps {
  searchParams: {
    q?: string; type?: string; location?: string;
    salaryMin?: string; salaryMax?: string; page?: string;
  };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const q         = searchParams.q?.trim()          || undefined;
  const location  = searchParams.location?.trim()   || undefined;
  const page      = Math.max(1, Number(searchParams.page || 1));
  const rawType   = searchParams.type?.toUpperCase();
  const typeFilter = rawType && Object.values(JobType).includes(rawType as JobType)
    ? (rawType as JobType) : undefined;
  const salaryMin = searchParams.salaryMin ? Number(searchParams.salaryMin) : undefined;
  const salaryMax = searchParams.salaryMax ? Number(searchParams.salaryMax) : undefined;

  const where = {
    status: JobStatus.ACTIVE,
    ...(q        && { title:    { contains: q,        mode: 'insensitive' as const } }),
    ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
    ...(typeFilter && { type: typeFilter }),
    ...(salaryMin  && { salaryMin: { gte: salaryMin } }),
    ...(salaryMax  && { salaryMax: { lte: salaryMax } }),
  };

  // Fetch jobs + optional candidate skills for match scores in parallel
  // Auth/resume fetch is wrapped so a DB hiccup never crashes the whole page
  let candidateSkills: string[] = [];
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { id: true, name: true, industry: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ]);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const resume = await prisma.resume.findUnique({
        where: { userId: user.id },
        select: { parsedData: true },
      });
      candidateSkills = ((resume?.parsedData as { skills?: string[] })?.skills) ?? [];
    }
  } catch {
    // Non-fatal — match badges simply won't show
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Find Your Next Job
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString()} job{total !== 1 ? 's' : ''} available
            {q ? ` for "${q}"` : ''}
            {location ? ` in ${location}` : ''}
          </p>

          {/* Search bar */}
          <form method="GET" action="/jobs" className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Job title, skills, or company"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:w-52">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                name="location"
                defaultValue={location}
                placeholder="City or Remote"
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

      {/* Body: filters + cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Filter sidebar */}
          <JobFilters />

          {/* Job cards */}
          <div className="flex-1 min-w-0">
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 text-center">
                <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 font-medium text-foreground">No jobs found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search term</p>
                <Link href="/jobs" className="mt-4 text-sm font-medium text-primary hover:underline">
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job) => {
                    const salary     = formatSalary(job.salaryMin, job.salaryMax);
                    const color      = tileColor(job.company.name);
                    const matchScore = computeMatchScore(candidateSkills, job.skills);
                    return (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white', color)}>
                            {job.company.name[0].toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', TYPE_STYLES[job.type])}>
                              {TYPE_LABELS[job.type]}
                            </span>
                            {matchScore !== null && (
                              <span className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-semibold',
                                matchScore >= 70 ? 'bg-green-50 text-green-700' :
                                matchScore >= 40 ? 'bg-amber-50 text-amber-700' :
                                                   'bg-red-50 text-red-600',
                              )}>
                                {matchScore}% match
                              </span>
                            )}
                            <SaveButton jobId={job.id} variant="icon" />
                          </div>
                        </div>

                        {/* Title + company */}
                        <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                          {job.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{job.company.name}</p>

                        {/* Meta */}
                        <div className="mt-3 flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          {salary && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                              <span>{salary} / yr</span>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {job.skills.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 3).map((s) => (
                              <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {timeAgo(new Date(job.createdAt))}
                          </span>
                          <span className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                            View Job
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
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
