import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { MapPin, IndianRupee, Clock, Search, Briefcase, ChevronRight, BadgeCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { JobType, JobStatus, ExperienceLevel } from '@prisma/client';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Pagination } from '@/components/ui/Pagination';
import { SaveButton } from '@/components/jobs/SaveButton';
import { SearchHistoryChips } from '@/components/jobs/SearchHistoryChips';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Find Jobs in India | KaamKaaj',
  description: 'Browse 50 Lakh+ jobs across India. Filter by job type, location, salary range.',
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

const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function tileColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

function formatSalaryMonthly(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    const monthly = Math.round(n / 12);
    return monthly >= 100000
      ? `₹${(monthly / 100000).toFixed(1)}L`
      : `₹${monthly.toLocaleString('en-IN')}`;
  };
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
  const norm = resumeSkills.map((s) => s.toLowerCase().trim());
  const matched = jobSkills.filter((s) =>
    norm.some((r) => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)),
  );
  return Math.round((matched.length / jobSkills.length) * 100);
}

const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  REMOTE: 'Work from Home', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};

const EXP_LABELS: Record<ExperienceLevel, string> = {
  FRESHER: 'Freshers only', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

// Map workMode/workType params to JobType enum values
function resolveTypeFilter(workModes: string[], workTypes: string[], legacyType?: string): JobType[] | undefined {
  const types = new Set<JobType>();
  if (legacyType) {
    const upper = legacyType.toUpperCase() as JobType;
    if (Object.values(JobType).includes(upper)) types.add(upper);
  }
  for (const mode of workModes) {
    if (mode === 'wfh') types.add(JobType.REMOTE);
    if (mode === 'wfo') { types.add(JobType.FULL_TIME); types.add(JobType.PART_TIME); types.add(JobType.CONTRACT); }
  }
  for (const wt of workTypes) {
    if (wt === 'full_time')  types.add(JobType.FULL_TIME);
    if (wt === 'part_time')  types.add(JobType.PART_TIME);
    if (wt === 'internship') types.add(JobType.INTERNSHIP);
  }
  return types.size > 0 ? Array.from(types) : undefined;
}

interface PageProps {
  searchParams: {
    q?: string; type?: string; experienceLevel?: string; location?: string;
    salaryMin?: string; salaryMax?: string; sort?: string; page?: string;
    workMode?: string; workType?: string; shift?: string; department?: string; datePosted?: string;
    companyId?: string;
  };
}

export default async function JobsPage({ searchParams }: PageProps) {
  const q          = searchParams.q?.trim() || undefined;
  const location   = searchParams.location?.trim() || undefined;
  const companyId  = searchParams.companyId?.trim() || undefined;
  const page       = Math.max(1, Number(searchParams.page || 1));
  const datePosted = searchParams.datePosted || 'all';
  const workModes  = searchParams.workMode?.split(',').filter(Boolean) ?? [];
  const workTypes  = searchParams.workType?.split(',').filter(Boolean) ?? [];
  const shifts     = searchParams.shift?.split(',').filter(Boolean) ?? [];
  const departments = searchParams.department?.split(',').filter(Boolean) ?? [];

  const sort =
    searchParams.sort === 'salary_desc' ? 'salary_desc' :
    searchParams.sort === 'salary_asc'  ? 'salary_asc' :
    searchParams.sort === 'date_new'    ? 'date_new' :
    searchParams.sort === 'trending'    ? 'trending' :
    'newest';

  const rawLevel = searchParams.experienceLevel?.toUpperCase();
  const levelFilter = rawLevel && Object.values(ExperienceLevel).includes(rawLevel as ExperienceLevel)
    ? (rawLevel as ExperienceLevel) : undefined;

  const typeFilter = resolveTypeFilter(workModes, workTypes, searchParams.type);

  // Monthly salary from new slider → convert to annual
  const monthlySalMin = searchParams.salaryMin ? Number(searchParams.salaryMin) : undefined;
  const annualSalMin  = monthlySalMin && monthlySalMin > 0 ? monthlySalMin * 12 : undefined;
  const annualSalMax  = searchParams.salaryMax ? Number(searchParams.salaryMax) : undefined;

  // Date posted filter
  let createdAtFilter: { gte: Date } | undefined;
  if (datePosted === '24h') createdAtFilter = { gte: new Date(Date.now() - 86400000) };
  else if (datePosted === '3d') createdAtFilter = { gte: new Date(Date.now() - 3 * 86400000) };
  else if (datePosted === '7d') createdAtFilter = { gte: new Date(Date.now() - 7 * 86400000) };

  // Build keyword OR conditions
  const keywordOr: Record<string, unknown>[] = [];
  if (q) {
    keywordOr.push(
      { title:       { contains: q, mode: 'insensitive' as const } },
      { description: { contains: q, mode: 'insensitive' as const } },
      { skills:      { hasSome: [q] } },
    );
  }
  if (shifts.includes('night')) keywordOr.push({ title: { contains: 'night shift', mode: 'insensitive' as const } });
  if (shifts.includes('day'))   keywordOr.push({ title: { contains: 'day shift',   mode: 'insensitive' as const } });
  if (workModes.includes('field')) keywordOr.push({ skills: { hasSome: ['Field Work', 'Field Job', 'Field Sales'] } });

  const where: Record<string, unknown> = {
    status: JobStatus.ACTIVE,
    ...(keywordOr.length > 0 && { OR: keywordOr }),
    ...(location      && { location:        { contains: location, mode: 'insensitive' as const } }),
    ...(typeFilter    && { type: { in: typeFilter } }),
    ...(levelFilter   && { experienceLevel: levelFilter }),
    ...(annualSalMin  && { salaryMin: { gte: annualSalMin } }),
    ...(annualSalMax  && { salaryMax: { lte: annualSalMax } }),
    ...(createdAtFilter && { createdAt: createdAtFilter }),
    ...(departments.length > 0 && { company: { industry: { in: departments } } }),
    ...(companyId     && { companyId }),
  };

  const filteredCompany = companyId
    ? await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } })
    : null;

  const orderBy =
    sort === 'trending'    ? { viewCount: 'desc' as const } :
    sort === 'salary_desc' ? { salaryMax: 'desc' as const } :
    sort === 'salary_asc'  ? { salaryMin: 'asc'  as const } :
                             { createdAt: 'desc' as const };

  let candidateSkills: string[] = [];
  let appliedJobIds: Set<string> = new Set();
  let savedJobIds:   Set<string> = new Set();
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { id: true, name: true, industry: true, isVerified: true } } },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.job.count({ where }),
  ]);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [resume, applications, savedJobs] = await Promise.all([
        prisma.resume.findUnique({ where: { userId: user.id }, select: { parsedData: true } }),
        prisma.application.findMany({ where: { candidateId: user.id }, select: { jobId: true } }),
        prisma.savedJob.findMany({ where: { userId: user.id }, select: { jobId: true } }),
      ]);
      candidateSkills = ((resume?.parsedData as { skills?: string[] })?.skills) ?? [];
      appliedJobIds   = new Set(applications.map(a => a.jobId));
      savedJobIds     = new Set(savedJobs.map(s => s.jobId));
    }
  } catch { /* non-fatal */ }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {total.toLocaleString()} Jobs — Find Your Next Job
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {q ? `Results for "${q}"` : filteredCompany ? `Jobs at ${filteredCompany.name}` : 'All active jobs'}
            {location ? ` in ${location}` : ''}
          </p>

          {/* Search bar */}
          <form method="GET" action="/jobs" className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Job title, skills, or company"
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:w-56">
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                name="location"
                defaultValue={location}
                placeholder="City or Remote"
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Search
            </button>
          </form>
          <Suspense>
            <SearchHistoryChips />
          </Suspense>
        </div>
      </div>

      {/* Body: filters + cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Filter sidebar */}
          <JobFilters />

          {/* Job cards */}
          <div className="flex-1 min-w-0">
            <p className="mb-4 text-sm text-muted-foreground">
              {total.toLocaleString()} result{total !== 1 ? 's' : ''}
            </p>

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
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const salary      = formatSalaryMonthly(job.salaryMin, job.salaryMax);
                    const color       = tileColor(job.company.name);
                    const matchScore  = computeMatchScore(candidateSkills, job.skills);
                    const isNew       = (Date.now() - new Date(job.createdAt).getTime()) < 3 * 86400000;
                    const hasApplied  = appliedJobIds.has(job.id);

                    return (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="group flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"
                      >
                        {/* Company logo */}
                        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white', color)}>
                          {job.company.name[0].toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {job.viewCount >= 10 && (
                                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
                                  🔥 Trending
                                </span>
                              )}
                              {isNew && !hasApplied && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                                  New
                                </span>
                              )}
                              {hasApplied && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                  ✓ Applied
                                </span>
                              )}
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
                              <SaveButton jobId={job.id} variant="icon" initialSaved={savedJobIds.has(job.id)} />
                            </div>
                          </div>

                          {/* Company name */}
                          <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-primary">
                            {job.company.name}
                            {job.company.isVerified && (
                              <BadgeCheck className="h-3.5 w-3.5 text-success shrink-0" />
                            )}
                          </p>

                          {/* Location + Salary row */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {job.location}
                            </span>
                            {salary && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                                {salary} monthly
                              </span>
                            )}
                          </div>

                          {/* Tags row */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3 shrink-0" />
                              {TYPE_LABELS[job.type]}
                            </span>
                            <span className="text-muted-foreground/30 text-xs">•</span>
                            <span className="text-xs text-muted-foreground">
                              {EXP_LABELS[job.experienceLevel]}
                            </span>
                            <span className="text-muted-foreground/30 text-xs">•</span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0" />
                              {timeAgo(new Date(job.createdAt))}
                            </span>
                          </div>
                        </div>

                        {/* Right arrow */}
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
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
