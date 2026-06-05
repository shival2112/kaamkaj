import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, IndianRupee, Briefcase, Users, Calendar,
  ChevronLeft, BadgeCheck, Clock, Flame, Zap, Share2,
  UserCheck, PhoneCall, Award,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { ApplyButton } from '@/components/jobs/ApplyButton';
import { SaveButton } from '@/components/jobs/SaveButton';
import { RecentlyViewedTracker } from '@/components/jobs/RecentlyViewedTracker';
import { JobShareButtons } from '@/components/jobs/JobShareButtons';
import { cn } from '@/lib/utils';
import { JobType, ExperienceLevel, JobStatus } from '@prisma/client';

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

function formatSalaryAnnual(min?: number | null, max?: number | null) {
  if (!min && !max) return 'Not disclosed';
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} / yr`;
  if (min) return `${fmt(min)}+ / yr`;
  return `Up to ${fmt(max!)} / yr`;
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

const TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  REMOTE: 'Work from Home', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const TYPE_STYLES: Record<JobType, string> = {
  FULL_TIME:  'bg-green-50 text-green-700',
  PART_TIME:  'bg-yellow-50 text-yellow-700',
  REMOTE:     'bg-blue-50 text-blue-700',
  CONTRACT:   'bg-purple-50 text-purple-700',
  INTERNSHIP: 'bg-orange-50 text-orange-700',
};
const EXP_LABELS: Record<ExperienceLevel, string> = {
  FRESHER: 'Freshers only', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
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
    openGraph: { title: `${job.title} at ${job.company.name}`, description: desc, type: 'article', siteName: 'KaamKaaj' },
    twitter:   { card: 'summary', title: `${job.title} at ${job.company.name}`, description: desc },
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
  } catch { /* not fatal */ }

  // Similar jobs
  const similarJobs = await prisma.job.findMany({
    where: {
      id:     { not: job.id },
      status: JobStatus.ACTIVE,
      OR: [
        { companyId: job.companyId },
        { location:  { contains: job.location.split(',')[0], mode: 'insensitive' } },
        { skills:    { hasSome: job.skills.slice(0, 3) } },
      ],
    },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const color          = tileColor(job.company.name);
  const salaryAnnual   = formatSalaryAnnual(job.salaryMin, job.salaryMax);
  const salaryMonthly  = formatSalaryMonthly(job.salaryMin, job.salaryMax);
  const postedAt       = new Date(job.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const isUrgent       = (Date.now() - new Date(job.createdAt).getTime()) < 7 * 86400000;
  const applicantCount = job._count.applications;

  // Derive department from company industry or skills
  const department = job.company.industry ?? 'General';
  // Determine shift from title/skills keywords
  const shift = job.title.toLowerCase().includes('night') || job.skills.some(s => s.toLowerCase().includes('night'))
    ? 'Night Shift' : 'Day Shift';

  return (
    <>
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
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    {salaryMonthly && (
                      <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{salaryMonthly} monthly</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Salary breakdown */}
              {(job.salaryMin || job.salaryMax) && (
                <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border border-border bg-secondary/30 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Fixed</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{salaryAnnual}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earning Potential</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {job.salaryMax
                        ? `₹${(job.salaryMax / 100000).toFixed(0)}L`
                        : salaryAnnual}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags row */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', TYPE_STYLES[job.type])}>
                  <Briefcase className="h-3 w-3" />
                  {TYPE_LABELS[job.type]}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {EXP_LABELS[job.experienceLevel]}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  {job.vacancies} vacanc{job.vacancies === 1 ? 'y' : 'ies'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex gap-3">
                <div className="flex-1">
                  <ApplyButton jobId={job.id} alreadyApplied={alreadyApplied} />
                </div>
                <div className="w-1/3">
                  <SaveButton jobId={job.id} initialSaved={alreadySaved} variant="full" />
                </div>
              </div>
            </div>

            {/* Job Highlights */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-foreground">Job highlights</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {isUrgent && (
                  <div className="flex items-start gap-3 rounded-lg bg-orange-50/60 p-3">
                    <Flame className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Urgently hiring</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-lg bg-yellow-50/60 p-3">
                  <Zap className="h-5 w-5 shrink-0 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fast HR reply</p>
                    <p className="text-xs text-muted-foreground mt-0.5">HR responded to most candidates in last 12 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-blue-50/60 p-3">
                  <Users className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{applicantCount} applicant{applicantCount !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Applied so far</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Role */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-foreground">Job role</h2>
              <div className="mt-4 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role / Category</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {job.skills.slice(0, 1).join('') || TYPE_LABELS[job.type]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employment type</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{TYPE_LABELS[job.type]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shift</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{shift}</p>
                </div>
              </div>
            </div>

            {/* Job Requirements */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-foreground">Job requirements</h2>
              <div className="mt-4 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{EXP_LABELS[job.experienceLevel]}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vacancies</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{job.vacancies}</p>
                </div>
                {job.expiresAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Last date to apply</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {new Date(job.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {postedAt}
                  </p>
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

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">

            {/* Get hired in 3 steps */}
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Get your dream job in 3 simple steps:</p>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Briefcase, label: 'Apply for job', color: 'text-primary bg-primary/10' },
                  { icon: UserCheck, label: 'Create profile', color: 'text-violet-600 bg-violet-50' },
                  { icon: PhoneCall, label: 'Schedule interview', color: 'text-orange-600 bg-orange-50' },
                  { icon: Award,     label: 'Get hired',         color: 'text-green-600 bg-green-50' },
                ].map(({ icon: Icon, label, color }, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold', color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-foreground">{label}</p>
                    {i < 3 && <div className="ml-auto h-4 w-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky apply card */}
            <div className="sticky top-6 rounded-xl border border-border bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-foreground">Apply for this job</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {applicantCount} candidate{applicantCount !== 1 ? 's' : ''} already applied
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

              <JobShareButtons title={job.title} company={job.company.name} />
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-foreground">Similar jobs</h2>
                <div className="mt-3 space-y-3">
                  {similarJobs.map(sj => {
                    const sjColor  = tileColor(sj.company.name);
                    const sjSalary = formatSalaryMonthly(sj.salaryMin, sj.salaryMax);
                    return (
                      <Link
                        key={sj.id}
                        href={`/jobs/${sj.id}`}
                        className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white', sjColor)}>
                          {sj.company.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">{sj.title}</h3>
                          <p className="text-xs text-muted-foreground">{sj.company.name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{sj.location}</span>
                            {sjSalary && <span>{sjSalary}/mo</span>}
                          </div>
                        </div>
                        <Share2 className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>

    <RecentlyViewedTracker jobId={job.id} />
    </>
  );
}
