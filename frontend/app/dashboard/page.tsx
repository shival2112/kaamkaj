'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Globe, Send, Calendar, Eye, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { KPICard } from '@/components/ui/KPICard';
import { StatusChip, mapDbStatus } from '@/components/ui/StatusChip';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { RecentlyViewedJobs } from '@/components/jobs/RecentlyViewedJobs';
import { RealtimeStatusListener } from '@/components/dashboard/RealtimeStatusListener';
import { ToastContainer, useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats { applications: number; savedJobs: number; interviews: number }

interface RecentApp {
  id: string;
  status: string;
  appliedAt: string;
  job: { id: string; title: string; location: string; company: { name: string } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function CircularProgress({ percent }: { percent: number }) {
  return (
    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray={`${percent} ${100 - percent}`} />
    </svg>
  );
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router  = useRouter();
  const { user, dbUser, isLoading } = useAuth();        // Supabase session
  const { data: nextSession, status: nextStatus } = useSession(); // NextAuth session
  const clearUser = useAuthStore((s) => s.clearUser);
  const { toasts, addToast, dismiss } = useToast();

  // Both auth mechanisms must finish loading before we make a redirect decision.
  const sessionReady = !isLoading && nextStatus !== 'loading';

  const supabaseRole  = (user?.user_metadata?.role as string ?? '').toUpperCase();
  const nextAuthRole  = (nextSession?.user?.role  as string ?? '').toUpperCase();

  // A candidate is valid if authenticated via EITHER mechanism with the CANDIDATE role.
  const isCandidate =
    (!!user && supabaseRole === 'CANDIDATE') ||
    (!!nextSession?.user && nextAuthRole === 'CANDIDATE');

  // Redirect once sessions have settled and the user is not a candidate.
  useEffect(() => {
    if (!sessionReady) return;
    if (!isCandidate) {
      // Could be employer / admin — send them to the right place
      const role = supabaseRole || nextAuthRole;
      if (role === 'EMPLOYER') { router.replace('/employer/dashboard'); return; }
      if (role === 'ADMIN')    { router.replace('/dashboard/admin');    return; }
      router.replace('/login');
    }
  }, [sessionReady, isCandidate, supabaseRole, nextAuthRole, router]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [recentApps,  setRecentApps]  = useState<RecentApp[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isCandidate) return;
    setDataLoading(true);
    Promise.all([
      fetch('/api/candidate/stats').then(r => r.json()),
      fetch('/api/candidate/applications?limit=4').then(r => r.json()),
    ]).then(([s, a]) => {
      setStats(s as Stats);
      setRecentApps((a as { applications?: RecentApp[] }).applications ?? []);
    }).catch(err => console.error('[dashboard] data fetch error:', err))
      .finally(() => setDataLoading(false));
  }, [isCandidate]);

  // ── Display values — Supabase dbUser first, NextAuth session as fallback ──
  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? nextSession?.user?.name ?? 'there';
  const role        = dbUser?.role ?? (isCandidate ? 'CANDIDATE' : 'CANDIDATE');
  const greeting    = useMemo(getGreeting, []);

  const profilePct = 25
    + (dbUser?.name   ? 25 : 0)
    + (dbUser?.avatar ? 25 : 0)
    + ((dbUser as { phone?: string } | null)?.phone ? 25 : 0);

  const initials = displayName.split(' ').map(w => w[0] ?? '').filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  // Show spinner while either auth mechanism is still loading.
  if (!sessionReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Sessions have settled but user is not a candidate — useEffect will redirect.
  if (!isCandidate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input type="text" placeholder="Search jobs, companies..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <Link href="/" aria-label="Visit website" title="Go to KaamKaaj" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-primary">
              <Globe className="h-5 w-5" />
            </Link>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {displayName} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats
              ? `You have ${stats.applications} application${stats.applications !== 1 ? 's' : ''} so far. Keep applying!`
              : "Welcome back! Here's your dashboard."}
          </p>

          {/* Profile completion banner */}
          <div className="mt-6 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center">
                <CircularProgress percent={profilePct} />
                <span className="absolute text-sm font-bold text-white">{profilePct}%</span>
              </div>
              <div>
                <p className="font-semibold text-white">Complete your profile</p>
                <p className="mt-0.5 text-sm text-violet-200">A complete profile gets 3× more recruiter views</p>
              </div>
            </div>
            <Link href="/dashboard/profile"
              className="shrink-0 rounded-lg border-2 border-white/40 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Complete profile
            </Link>
          </div>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KPICard icon={<Send className="h-5 w-5" />} label="Applications Sent"
              value={dataLoading ? '—' : stats?.applications ?? 0} change={dataLoading ? '' : 'total'} />
            <KPICard icon={<Calendar className="h-5 w-5" />} label="Shortlisted"
              value={dataLoading ? '—' : stats?.interviews ?? 0} change={dataLoading ? '' : 'total'} />
            <KPICard icon={<Eye className="h-5 w-5" />} label="Profile Views"
              value="—" change="coming soon" />
            <KPICard icon={<Bookmark className="h-5 w-5" />} label="Saved Jobs"
              value={dataLoading ? '—' : stats?.savedJobs ?? 0} change={dataLoading ? '' : 'total'} />
          </div>

          {/* Recent Applications */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Applications</h2>
              <Link href="/dashboard/applications" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-4 border-b border-gray-100 px-6 py-3">
              {(['JOB', 'STAGE', 'APPLIED', 'ACTIONS'] as const).map((col) => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : recentApps.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No applications yet.</p>
                <Link href="/jobs" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                  Browse jobs →
                </Link>
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app.id}
                  className="grid grid-cols-4 items-center border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${tileColor(app.job.company.name)}`}>
                      {app.job.company.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{app.job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{app.job.company.name} · {app.job.location}</p>
                    </div>
                  </div>
                  <StatusChip status={mapDbStatus(app.status)} />
                  <p className="text-sm text-muted-foreground">
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <Link href={`/jobs/${app.job.id}`}
                    className="w-fit rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    View Job
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Recently Viewed Jobs */}
          <RecentlyViewedJobs />

        </div>
      </div>
    </div>

    {/* Real-time application status notifications (Supabase Realtime) */}
    {user?.id && (
      <RealtimeStatusListener userId={user.id} onNotification={addToast} />
    )}
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
