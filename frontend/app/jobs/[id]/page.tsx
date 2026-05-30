import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, IndianRupee, Briefcase, Users, Calendar,
  ChevronLeft, BadgeCheck, Clock,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ApplyButton } from '@/components/jobs/ApplyButton';
import { SaveButton } from '@/components/jobs/SaveButton';
import { cn } from '@/lib/utils';
import { JobType, ExperienceLevel } from '@prisma/client';

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
  if (!min && !max) return 'Not disclosed';
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `${fmt(min)}+ / yr`;
  return `Up to ${fmt(max!)} / yr`;
}

const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const TYPE_STYLES: Record<JobType, string> = {
  FULL_TIME:  'bg-green-50 text-green-700',
  PART_TIME:  'bg-yellow-50 text-yellow-700',
  REMOTE:     'bg-blue-50 text-blue-700',
  CONTRACT:   'bg-purple-50 text-purple-700',
  INTERNSHIP: 'bg-orange-50 text-orange-700',
};
const EXP_LABELS: Record<ExperienceLevel, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { company: { select: { name: true } } },
  });
  if (!job) return { title: 'Job Not Found | KaamKaaj' };
  const desc = job.description.slice(0, 155) + '…';
  return {
    title: `${job.title} at ${job.company.name} | KaamKaaj`,
    description: desc,
    openGraph: {
      title: `${job.title} at ${job.company.name}`,
      description: desc,
      type: 'article',
      siteName: 'KaamKaaj',
    },
    twitter: {
      card: 'summary',
      title: `${job.title} at ${job.company.name}`,
      description: desc,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });

  if (!job) notFound();

  // Check if logged-in candidate already applied / saved (non-fatal if not logged in)
  let alreadyApplied = false;
  let alreadySaved   = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [existing, savedRecord] = await Promise.all([
        prisma.application.findUnique({
          where: { jobId_candidateId: { jobId: job.id, candidateId: user.id } },
        }),
        prisma.savedJob.findUnique({
          where: { userId_jobId: { userId: user.id, jobId: job.id } },
        }),
      ]);
      alreadyApplied = !!existing;
      alreadySaved   = !!savedRecord;
    }
  } catch {
    // not fatal
  }

  const color = tileColor(job.company.name);
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const postedAt = new Date(job.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Header card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={cn('flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white', color)}>
                  {job.company.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-foreground sm:text-2xl">{job.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-primary">{job.company.name}</span>
                    {job.company.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                    {job.company.industry && (
                      <span className="text-sm text-muted-foreground">{job.company.industry}</span>
                    )}
                  </div>

                  {/* Tags row */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', TYPE_STYLES[job.type])}>
                      {TYPE_LABELS[job.type]}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      {EXP_LABELS[job.experienceLevel]}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      {job.vacancies} vacanc{job.vacancies === 1 ? 'y' : 'ies'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key details grid */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {job.location}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                    <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                    {salary}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applicants</p>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {job._count.applications}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <div className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {postedAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-foreground">Job Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-foreground">Required Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About company */}
            {job.company.description && (
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-foreground">About {job.company.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {job.company.description}
                </p>
                {job.company.size && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Company size: <span className="font-medium text-foreground">{job.company.size} employees</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar: apply card ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
            <div className="sticky top-6 rounded-xl border border-border bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-foreground">Apply for this job</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {job._count.applications} candidate{job._count.applications !== 1 ? 's' : ''} already applied
              </p>

              <div className="mt-4 space-y-2">
                <ApplyButton jobId={job.id} alreadyApplied={alreadyApplied} />
                <SaveButton jobId={job.id} initialSaved={alreadySaved} variant="full" />
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  {TYPE_LABELS[job.type]}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {job.location}
                </div>
                {job.expiresAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Closes {new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
