import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, BadgeCheck, Building2, Users, Globe,
  MapPin, IndianRupee, Clock, Briefcase,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { JobStatus, JobType, ExperienceLevel } from '@prisma/client';
import { cn } from '@/lib/utils';
import { CompanyFollowButton } from '@/components/companies/CompanyFollowButton';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const TYPE_STYLES: Record<JobType, string> = {
  FULL_TIME:  'bg-green-50 text-green-700',
  PART_TIME:  'bg-yellow-50 text-yellow-700',
  REMOTE:     'bg-blue-50 text-blue-700',
  CONTRACT:   'bg-purple-50 text-purple-700',
  INTERNSHIP: 'bg-orange-50 text-orange-700',
};
const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const EXP_LABELS: Record<ExperienceLevel, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: { name: true, industry: true, description: true },
  });
  if (!company) return { title: 'Company Not Found | KaamKaaj' };
  const desc = (company.description ?? `Learn about ${company.name} and explore open jobs.`).slice(0, 155);
  return {
    title: `${company.name} | KaamKaaj`,
    description: desc,
    openGraph: { title: company.name, description: desc, type: 'profile', siteName: 'KaamKaaj' },
    twitter: { card: 'summary', title: company.name, description: desc },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        where: { status: JobStatus.ACTIVE },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { applications: true } } },
      },
      _count: { select: { jobs: true } },
    },
  });

  if (!company) notFound();

  const color = tileColor(company.name);
  const activeJobs = company.jobs.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient hero */}
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-secondary to-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/companies"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Companies
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className={cn('flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-md', color)}>
              {company.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{company.name}</h1>
                {company.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {company.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {company.industry}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {company.size} employees
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
              <div className="mt-3">
                <CompanyFollowButton companyId={company.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* Main: About + Jobs */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* About */}
            {company.description && (
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-foreground">About {company.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {company.description}
                </p>
              </div>
            )}

            {/* Open jobs */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  Open Positions
                  <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {activeJobs}
                  </span>
                </h2>
                <Link href={`/jobs?q=${encodeURIComponent(company.name)}`} className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>

              {activeJobs === 0 ? (
                <div className="mt-6 flex flex-col items-center py-8 text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No open positions right now.</p>
                  <p className="text-xs text-muted-foreground">Check back later or explore other companies.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {company.jobs.map((job) => {
                    const salary = formatSalary(job.salaryMin, job.salaryMax);
                    return (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-all duration-150 hover:border-primary/30 hover:bg-secondary/50 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground transition-colors group-hover:text-primary">
                            {job.title}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            {salary && (
                              <span className="flex items-center gap-1">
                                <IndianRupee className="h-3.5 w-3.5" />
                                {salary} / yr
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {timeAgo(new Date(job.createdAt))}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', TYPE_STYLES[job.type])}>
                            {TYPE_LABELS[job.type]}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {EXP_LABELS[job.experienceLevel]}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: quick stats */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0">
            <div className="sticky top-6 rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Company Overview</h3>
              <div className="space-y-3 text-sm">
                {company.industry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium text-foreground text-right">{company.industry}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company size</span>
                    <span className="font-medium text-foreground">{company.size} employees</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open jobs</span>
                  <span className="font-medium text-primary">{activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cn('font-medium', company.isVerified ? 'text-green-600' : 'text-muted-foreground')}>
                    {company.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <Link
                href={`/jobs?q=${encodeURIComponent(company.name)}`}
                className="mt-2 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                View All Jobs
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
