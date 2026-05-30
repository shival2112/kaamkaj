'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, PlusCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';
import { StatusChip, mapDbStatus } from '@/components/ui/StatusChip';
import {
  LayoutDashboard, Layers, BarChart3,
} from 'lucide-react';

const EMPLOYER_NAV: SidebarNavSection[] = [
  {
    label: 'Manage',
    items: [
      { href: '/employer/dashboard',             label: 'Overview',              icon: LayoutDashboard },
      { href: '/employer/dashboard/listings',    label: 'My Listings',           icon: Layers },
      { href: '/employer/dashboard/applications',label: 'Applications Received', icon: ClipboardList },
      { href: '/employer/dashboard/analytics',   label: 'Analytics',             icon: BarChart3 },
    ],
  },
];

const NEXT_STATUSES: Record<string, { label: string; value: string; style: string }[]> = {
  APPLIED:     [{ label: 'Review',    value: 'REVIEWING',   style: 'text-sky-700 hover:bg-sky-50' },
                { label: 'Shortlist', value: 'SHORTLISTED', style: 'text-yellow-700 hover:bg-yellow-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  REVIEWING:   [{ label: 'Shortlist', value: 'SHORTLISTED', style: 'text-yellow-700 hover:bg-yellow-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  SHORTLISTED: [{ label: 'Hire',      value: 'HIRED',       style: 'text-emerald-700 hover:bg-emerald-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  REJECTED: [], HIRED: [],
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

interface Application {
  id: string; status: string; appliedAt: string;
  job: { id: string; title: string };
  candidate: { id: string; name: string; email: string };
}

function StageActions({ app, onUpdated }: { app: Application; onUpdated: (id: string, s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const nexts = NEXT_STATUSES[app.status] ?? [];
  if (nexts.length === 0) return null;

  const update = async (status: string) => {
    setLoading(true); setOpen(false);
    const res = await fetch(`/api/employer/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onUpdated(app.id, status);
    setLoading(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} disabled={loading}
        className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
        {loading ? '…' : 'Update'} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-border bg-white shadow-lg">
          {nexts.map(n => (
            <button key={n.value} onClick={() => update(n.value)}
              className={cn('block w-full px-4 py-2 text-left text-xs font-medium transition-colors', n.style)}>
              {n.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const [apps,    setApps]    = useState<Application[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const jobId = searchParams.get('jobId') ?? '';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const url = `/api/employer/applications${jobId ? `?jobId=${jobId}` : ''}`;
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then((d: { applications?: Application[]; total?: number }) => {
        setApps(d.applications ?? []);
        setTotal(d.total ?? 0);
      })
      .catch((err: Error) => console.error('[employer/applications]', err))
      .finally(() => setLoading(false));
  }, [user, jobId]);

  const handleUpdated = (id: string, status: string) =>
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const handleLogout = async () => { await createSupabaseClient().auth.signOut(); clearUser(); router.push('/'); };

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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Applications Received</h1>
            {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
          </div>
          {jobId && (
            <button onClick={() => router.push('/employer/dashboard/applications')}
              className="text-xs text-primary hover:underline">
              ← All applications
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['CANDIDATE', 'JOB', 'STAGE', 'APPLIED', 'UPDATE STAGE'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : apps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 font-medium text-foreground">No applications yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Applications will appear here once candidates apply to your jobs</p>
              </div>
            ) : apps.map(app => (
              <div key={app.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(app.candidate.name)}`}>
                    {app.candidate.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{app.candidate.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{app.candidate.email}</p>
                  </div>
                </div>
                <p className="truncate text-sm text-muted-foreground">{app.job.title}</p>
                <StatusChip status={mapDbStatus(app.status)} />
                <p className="text-sm text-muted-foreground">
                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <StageActions app={app} onUpdated={handleUpdated} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SPINNER = (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function EmployerApplicationsPage() {
  return <Suspense fallback={SPINNER}><ApplicationsContent /></Suspense>;
}
