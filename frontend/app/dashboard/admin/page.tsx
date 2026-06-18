'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Bell, Globe, Users, Briefcase, ClipboardList,
  TrendingUp, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { KPICard } from '@/components/ui/KPICard';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Stats {
  totalUsers: number; totalJobs: number; activeJobs: number;
  totalApplications: number; newUsersToday: number;
}

interface UserRow {
  id: string; name: string; email: string; role: string;
  isVerified: boolean; createdAt: string;
  _count: { applications: number };
}

interface JobRow {
  id: string; title: string; location: string; status: string; createdAt: string;
  company: { name: string };
  _count: { applications: number };
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const ROLE_STYLES: Record<string, string> = {
  CANDIDATE: 'bg-blue-50 text-blue-700',
  EMPLOYER:  'bg-violet-50 text-violet-700',
  ADMIN:     'bg-primary/10 text-primary',
};

const JOB_STATUS_STYLES: Record<string, string> = {
  ACTIVE:  'bg-green-50 text-green-700',
  DRAFT:   'bg-yellow-50 text-yellow-700',
  CLOSED:  'bg-gray-100 text-gray-500',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboardPage() {
  const user   = useAuthStore((s) => s.user);
  const dbUser = useAuthStore((s) => s.dbUser);

  const [stats,        setStats]        = useState<Stats | null>(null);
  const [recentUsers,  setRecentUsers]  = useState<UserRow[]>([]);
  const [recentJobs,   setRecentJobs]   = useState<JobRow[]>([]);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const { toasts, addToast, dismiss } = useToast();

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    try {
      const [s, u, j] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/users?page=1').then(r => r.json()),
        fetch('/api/admin/jobs?page=1').then(r => r.json()),
      ]);
      setStats(s as Stats);
      setRecentUsers(((u as { users?: UserRow[] }).users ?? []).slice(0, 5));
      setRecentJobs(((j as { jobs?: JobRow[] }).jobs ?? []).slice(0, 5));
      setLastRefreshed(new Date());
    } finally {
      if (!silent) setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
    const interval = setInterval(() => fetchData(true), 60_000);
    return () => clearInterval(interval);
  }, [user, fetchData]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'Admin';
  const initials    = displayName.split(' ').map((w: string) => w[0] ?? '').filter(Boolean).slice(0, 2).join('').toUpperCase() || 'A';
  const greeting    = useMemo(getGreeting, []);

  useEffect(() => {
    if (!user) return;
    if (!sessionStorage.getItem('admin_welcome_shown')) {
      sessionStorage.setItem('admin_welcome_shown', '1');
      addToast({ title: `Welcome back, ${displayName}!`, message: 'Admin dashboard loaded', variant: 'default', duration: 3000 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input type="text" placeholder="Search users, jobs..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Notifications" className="relative rounded-lg p-2 text-muted-foreground hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <Link href="/" aria-label="Visit website" className="rounded-lg p-2 text-muted-foreground hover:bg-gray-100 hover:text-primary">
            <Globe className="h-5 w-5" />
          </Link>
          <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{initials}</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{greeting}, {displayName} 👋</h1>
              <p className="text-sm text-muted-foreground">Platform overview — all systems operational.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              Live
            </span>
            {lastRefreshed && (
              <span className="text-xs text-muted-foreground">
                Updated {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={() => fetchData()} aria-label="Refresh stats"
              className="rounded-lg border border-gray-200 p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KPICard icon={<Users className="h-5 w-5" />} label="Total Users"
            value={dataLoading ? '—' : stats?.totalUsers ?? 0} change={dataLoading ? '' : `+${stats?.newUsersToday ?? 0} today`} />
          <KPICard icon={<Briefcase className="h-5 w-5" />} label="Total Jobs"
            value={dataLoading ? '—' : stats?.totalJobs ?? 0} change={dataLoading ? '' : `${stats?.activeJobs ?? 0} active`} />
          <KPICard icon={<ClipboardList className="h-5 w-5" />} label="Applications"
            value={dataLoading ? '—' : stats?.totalApplications ?? 0} change={dataLoading ? '' : 'total'} />
          <KPICard icon={<TrendingUp className="h-5 w-5" />} label="New Today"
            value={dataLoading ? '—' : stats?.newUsersToday ?? 0} change={dataLoading ? '' : 'new users'} />
        </div>

        {/* Recent Users */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-foreground">Recent Users</h2>
            <Link href="/dashboard/admin/users" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-6 py-3">
            {(['USER', 'EMAIL', 'ROLE', 'JOINED', 'STATUS'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>
          {dataLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No users yet.</p>
          ) : recentUsers.map(u => (
            <div key={u.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(u.name)}`}>
                  {u.name[0]?.toUpperCase() ?? '?'}
                </div>
                <p className="truncate text-sm font-semibold text-foreground">{u.name}</p>
              </div>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-600')}>
                {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
              </span>
              <p className="text-sm text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                u.isVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                {u.isVerified ? 'Active' : 'Suspended'}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-foreground">Recent Jobs</h2>
            <Link href="/dashboard/admin/jobs" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-gray-100 px-6 py-3">
            {(['JOB TITLE', 'COMPANY', 'APPS', 'STATUS', 'POSTED'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>
          {dataLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : recentJobs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No jobs yet.</p>
          ) : recentJobs.map(job => (
            <div key={job.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${tileColor(job.company.name)}`}>
                  {job.company.name[0]?.toUpperCase() ?? '?'}
                </div>
                <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
              </div>
              <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
              <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', JOB_STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-500')}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </span>
              <p className="text-sm text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
