'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, Globe, Layers, Users, Calendar,
  CheckCircle2, PlusCircle, ClipboardList, BarChart3,
  Settings, LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { KPICard } from '@/components/ui/KPICard';
import { StatusChip, mapDbStatus } from '@/components/ui/StatusChip';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';

// ─── Nav ─────────────────────────────────────────────────────────────────────

const EMPLOYER_NAV: SidebarNavSection[] = [
  {
    label: 'Manage',
    items: [
      { href: '/employer/dashboard',             label: 'Overview',              icon: LayoutDashboard },
      { href: '/employer/dashboard/listings',     label: 'My Listings',           icon: Layers },
      { href: '/employer/dashboard/applications', label: 'Applications Received', icon: ClipboardList },
      { href: '/employer/dashboard/analytics',    label: 'Analytics',             icon: BarChart3 },
    ],
  },
  { label: 'Account', items: [{ href: '/employer/dashboard/settings', label: 'Settings', icon: Settings }] },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats { activeListings: number; totalApplicants: number; shortlisted: number; filled: number }
type JobStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EXPIRED';
interface Listing {
  id: string; title: string; location: string; status: JobStatus; createdAt: string;
  _count: { applications: number };
}
interface RecentApp {
  id: string; status: string; appliedAt: string;
  job: { id: string; title: string };
  candidate: { name: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<JobStatus, { label: string; style: string }> = {
  ACTIVE:  { label: 'Active',  style: 'bg-green-50 text-green-700' },
  DRAFT:   { label: 'Paused',  style: 'bg-yellow-50 text-yellow-700' },
  CLOSED:  { label: 'Closed',  style: 'bg-gray-100 text-gray-500' },
  EXPIRED: { label: 'Expired', style: 'bg-gray-100 text-gray-500' },
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? 'CANDIDATE').toUpperCase();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole !== 'EMPLOYER') router.replace('/dashboard');
    }
  }, [user, isLoading, userRole, router]);

  // ── Real data ────────────────────────────────────────────────────────────────
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || userRole !== 'EMPLOYER') return;
    setDataLoading(true);
    Promise.all([
      fetch('/api/employer/stats').then(r => r.json()),
      fetch('/api/employer/jobs').then(r => r.json()),
      fetch('/api/employer/applications?limit=4').then(r => r.json()),
    ]).then(([s, j, a]) => {
      setStats(s);
      setListings((j.jobs ?? []).slice(0, 4));
      setRecentApps(a.applications ?? []);
    }).finally(() => setDataLoading(false));
  }, [user, userRole]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const greeting = useMemo(getGreeting, []);

  const initials = displayName.split(' ').map((w: string) => w[0] ?? '').filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser(); router.push('/');
  };

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role="Employer" onLogout={handleLogout}
        primaryButtonLabel="Post a Job" primaryButtonIcon={PlusCircle}
        onPrimaryButton={() => router.push('/employer/dashboard/post-job')}
        navSections={EMPLOYER_NAV} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input type="text" placeholder="Search candidates, listings..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button aria-label="Language" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100">
              <Globe className="h-5 w-5" />
            </button>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{initials}</div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {displayName} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats
              ? `${stats.activeListings} active listing${stats.activeListings !== 1 ? 's' : ''} · ${stats.totalApplicants} total applicant${stats.totalApplicants !== 1 ? 's' : ''}`
              : "Here's what's happening with your listings today."}
          </p>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KPICard icon={<Layers className="h-5 w-5" />} label="Active Listings"
              value={dataLoading ? '—' : stats?.activeListings ?? 0} change={dataLoading ? '' : 'total'} />
            <KPICard icon={<Users className="h-5 w-5" />} label="Total Applicants"
              value={dataLoading ? '—' : stats?.totalApplicants ?? 0} change={dataLoading ? '' : 'total'} />
            <KPICard icon={<Calendar className="h-5 w-5" />} label="Shortlisted"
              value={dataLoading ? '—' : stats?.shortlisted ?? 0} change={dataLoading ? '' : 'total'} />
            <KPICard icon={<CheckCircle2 className="h-5 w-5" />} label="Jobs Filled"
              value={dataLoading ? '—' : stats?.filled ?? 0} change={dataLoading ? '' : 'total'} />
          </div>

          {/* My Job Listings */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">My Job Listings</h2>
              <Link href="/employer/dashboard/listings" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['JOB TITLE', 'APPLICATIONS', 'STATUS', 'POSTED', 'ACTIONS'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : listings.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
                <Link href="/employer/dashboard/post-job" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  <PlusCircle className="h-4 w-4" /> Post your first job
                </Link>
              </div>
            ) : listings.map(job => {
              const info = STATUS_LABEL[job.status] ?? STATUS_LABEL.CLOSED;
              return (
                <div key={job.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{job.location}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', info.style)}>{info.label}</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <Link href={`/employer/dashboard/applications?jobId=${job.id}`}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                    Applicants
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Recent Applicants */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Applicants</h2>
              <Link href="/employer/dashboard/applications" className="text-sm font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 border-b border-gray-100 px-6 py-3">
              {(['CANDIDATE', 'JOB APPLIED FOR', 'STAGE', 'APPLIED'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : recentApps.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No applications yet. Post jobs to start receiving applicants.</p>
              </div>
            ) : recentApps.map(app => (
              <div key={app.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(app.candidate.name)}`}>
                    {app.candidate.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{app.candidate.name}</p>
                </div>
                <p className="truncate text-sm text-muted-foreground">{app.job.title}</p>
                <StatusChip status={mapDbStatus(app.status)} />
                <p className="text-sm text-muted-foreground">
                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
