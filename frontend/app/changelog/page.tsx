import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Zap, Star, LayoutDashboard, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | KaamKaaj',
  description: 'KaamKaaj platform updates, new features, and improvements.',
};

interface ChangeEntry {
  date: string;
  version: string;
  type: 'feature' | 'improvement' | 'fix';
  title: string;
  description: string;
}

const CHANGELOG: { month: string; entries: ChangeEntry[] }[] = [
  {
    month: 'June 2026',
    entries: [
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Interview Countdown', description: 'Candidate dashboard now shows a live countdown to the next scheduled interview, with days/hours remaining.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Application Timeline View', description: 'Toggle between table view and a vertical timeline on My Applications, showing every status change with timestamps.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Rejection Feedback', description: 'When an employer provides a rejection reason, candidates now see a styled feedback message instead of just a "Rejected" chip.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Resume Completeness Score', description: 'Candidate dashboard now computes a 0–100% completeness score from name, bio, headline, skills, experience, and resume file.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Offer Letter Generator', description: 'Employers can generate a styled HTML offer letter (role, salary, start date) and email it directly to the candidate.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Duplicate Application Detector', description: 'Employer applications list now badges candidates who have applied to more than one of the company\'s jobs.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Interview No-show Tracker', description: 'Employer applications now surface a "No-show" warning badge for candidates who previously missed a scheduled interview.' },
      { date: '2026-06-17', version: 'v27', type: 'improvement', title: 'Admin Live KPI Refresh', description: 'Admin dashboard KPIs auto-refresh every 60 seconds with a "Live" indicator dot and manual refresh button.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Job Quality Score', description: 'Admin jobs table shows a quality score (0–100%) based on whether salary, skills, long description, and expiry are set.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Flagged Jobs Review Queue', description: 'Dedicated admin page (/dashboard/admin/flagged-jobs) lists all reported jobs sorted by report count with inline triage actions.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Email Verification Gate', description: 'Job apply and job post routes now check emailVerified; unverified users see a clear error with a resend-verification link.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Referral Tracking', description: 'Referral links (?ref=userId) on job URLs are stored on the Application record; admin API exposes top-referrer report.' },
      { date: '2026-06-17', version: 'v27', type: 'feature',     title: 'Search History', description: 'Last 5 searches saved in localStorage; quick-pick chips appear below the search bar on /jobs for one-click re-search.' },
    ],
  },
  {
    month: 'May 2026',
    entries: [
      { date: '2026-05-20', version: 'v26', type: 'improvement', title: 'Admin Jobs Deep Dive', description: 'Stats strip, experience-level filter, page-size selector, jump-to-page, bulk permanent delete, and CVR % sub-text added to admin jobs.' },
      { date: '2026-05-20', version: 'v26', type: 'improvement', title: 'Mandatory Withdrawal Reason', description: 'Candidates must provide a reason (≥10 chars) when withdrawing an application; logged server-side.' },
      { date: '2026-05-15', version: 'v25', type: 'feature',     title: 'Recruiter Portal', description: 'Full recruiter sub-account module: dashboard, jobs, applications, pipeline, candidate profiles, and interview evaluation form.' },
      { date: '2026-05-10', version: 'v24', type: 'feature',     title: 'Platform Hardening', description: 'Change password from profile, job clone/repost, interview feedback, candidate CSV export, abuse reports, review moderation, admin announcements, recruiter sub-accounts, admin settings enforcement, and stale job auto-close.' },
    ],
  },
  {
    month: 'April 2026',
    entries: [
      { date: '2026-04-20', version: 'v23', type: 'feature',     title: 'Full-text Search & Company Reviews', description: 'Job search now covers title, description, and skills. Candidates can leave star-rated company reviews. Job templates for employers.' },
      { date: '2026-04-15', version: 'v22', type: 'feature',     title: 'Discovery & Analytics', description: 'Trending sort, cover letter templates, daily rate limit, company follow, admin user detail pages, and notification preferences.' },
      { date: '2026-04-10', version: 'v21', type: 'feature',     title: 'Advanced Engagement', description: 'Job view counter, employer application notes, status history log, admin CSV export, candidate star ratings, and experience level filter.' },
      { date: '2026-04-05', version: 'v20', type: 'feature',     title: 'Quality & PWA', description: 'Vitest unit tests, PWA manifest + service worker, sitemap.ts, robots.ts, dark mode, and accessibility skip-link.' },
    ],
  },
  {
    month: 'March 2026',
    entries: [
      { date: '2026-03-25', version: 'v19', type: 'feature',     title: 'Real-time Notifications', description: 'Supabase Realtime on employer bell and candidate dashboard; toast notifications on status changes; interview scheduled emails.' },
      { date: '2026-03-20', version: 'v18', type: 'improvement', title: 'Employer & Admin Gaps', description: 'Employer company profile edit with real DB, job expiry auto-close, admin bulk actions, and audit log page.' },
      { date: '2026-03-15', version: 'v17', type: 'feature',     title: 'Candidate Experience II', description: 'Similar jobs, recently viewed, cover letter editor, application withdrawal, and job alerts.' },
      { date: '2026-03-10', version: 'v16', type: 'feature',     title: 'Core Pages', description: 'Companies listing/detail, password reset flow, and public candidate profile page.' },
    ],
  },
];

const TYPE_CONFIG = {
  feature:     { label: 'New',         cls: 'bg-primary/10 text-primary',    icon: Star },
  improvement: { label: 'Improved',    cls: 'bg-blue-50 text-blue-700',      icon: Zap },
  fix:         { label: 'Fixed',       cls: 'bg-green-50 text-green-700',    icon: CheckCircle2 },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Changelog</h1>
              <p className="text-sm text-muted-foreground">KaamKaaj — feature updates &amp; improvements</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {Object.entries(TYPE_CONFIG).map(([key, { label, cls }]) => (
              <span key={key} className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">Built on Next.js 14 · Supabase · Prisma</span>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {CHANGELOG.map(({ month, entries }) => (
          <div key={month} className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
              <span className="h-px flex-1 bg-gray-200" />
              <span>{month}</span>
              <span className="h-px flex-1 bg-gray-200" />
            </h2>
            <div className="space-y-3">
              {entries.map((entry, i) => {
                const { label, cls, icon: Icon } = TYPE_CONFIG[entry.type];
                return (
                  <div key={i} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{entry.title}</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold text-foreground">Built as a portfolio project</p>
          <p className="text-sm text-muted-foreground">KaamKaaj is a full-stack job portal demo showcasing modern Next.js patterns, real-time features, and production-grade UX.</p>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
              Browse Jobs
            </Link>
            <Link href="/companies" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">
              Companies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
