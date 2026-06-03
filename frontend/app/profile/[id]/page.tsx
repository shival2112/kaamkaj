import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Briefcase, Calendar, FileText, ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { ShareProfileButton } from '@/components/profile/ShareProfileButton';

// ── Helpers ────────────────────────────────────────────────────────────────────

const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function tileColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher',
  JUNIOR:  '1–3 years experience',
  MID:     '3–6 years experience',
  SENIOR:  '6–10 years experience',
  LEAD:    '10+ years experience',
};

const EXP_COLORS: Record<string, string> = {
  FRESHER: 'bg-orange-50 text-orange-700',
  JUNIOR:  'bg-blue-50 text-blue-700',
  MID:     'bg-violet-50 text-violet-700',
  SENIOR:  'bg-green-50 text-green-700',
  LEAD:    'bg-amber-50 text-amber-700',
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface ParsedData {
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experienceLevel?: string;
  profileCompleted?: boolean;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.id, role: 'CANDIDATE' },
    select: { name: true, resume: { select: { parsedData: true } } },
  });
  if (!user) return { title: 'Profile Not Found | KaamKaaj' };
  const data = (user.resume?.parsedData as ParsedData) ?? {};
  const desc = data.headline
    ? `${user.name} — ${data.headline}`
    : `View ${user.name}'s profile on KaamKaaj`;
  return {
    title: `${user.name} | KaamKaaj`,
    description: desc,
    openGraph: { title: user.name, description: desc, type: 'profile', siteName: 'KaamKaaj' },
    twitter: { card: 'summary', title: user.name, description: desc },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id, role: 'CANDIDATE' },
    select: {
      id: true,
      name: true,
      avatar: true,
      createdAt: true,
      resume: { select: { parsedData: true, fileUrl: true } },
    },
  });

  if (!user) notFound();

  const data       = (user.resume?.parsedData as ParsedData) ?? {};
  const completed  = data.profileCompleted ?? false;
  const color      = tileColor(user.name);
  const expLevel   = data.experienceLevel ?? 'FRESHER';
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });

  // Show a minimal "not set up" state if onboarding never completed
  if (!completed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white', color)}>
          {user.name[0]?.toUpperCase()}
        </div>
        <p className="font-semibold text-foreground">{user.name}</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          This candidate hasn&apos;t completed their profile yet.
        </p>
        <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
          Browse open jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient hero */}
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-secondary to-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/jobs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Browse Jobs
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            {/* Avatar */}
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className={cn(
                'flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-4xl font-bold text-white shadow-md',
                color,
              )}>
                {user.name[0]?.toUpperCase()}
              </div>
            )}

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{user.name}</h1>
                  {data.headline && (
                    <p className="mt-1 text-base font-medium text-primary">{data.headline}</p>
                  )}
                </div>
                <ShareProfileButton />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {data.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {data.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Joined {joinedDate}
                </span>
                {user.resume?.fileUrl && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 shrink-0" />
                    Resume available
                  </span>
                )}
              </div>

              {/* Experience badge */}
              <div className="mt-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  EXP_COLORS[expLevel] ?? 'bg-secondary text-muted-foreground',
                )}>
                  <Briefcase className="h-3.5 w-3.5" />
                  {EXP_LABELS[expLevel] ?? expLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-5">

        {/* Bio */}
        {data.bio && (
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-foreground">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {data.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-foreground">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA for employers */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-foreground">Interested in this candidate?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Post a job on KaamKaaj and find more qualified candidates like {user.name.split(' ')[0]}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Browse all jobs
            </Link>
            <Link
              href="/employer/dashboard/post-job"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Post a Job
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
