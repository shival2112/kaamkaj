'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, PlusCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';
import {
  LayoutDashboard, ClipboardList, BarChart3,
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

type JobStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'EXPIRED';

interface Listing {
  id: string; title: string; location: string; type: string;
  status: JobStatus; createdAt: string;
  _count: { applications: number };
}

const STATUS_MAP: Record<JobStatus, { label: string; style: string }> = {
  ACTIVE:   { label: 'Active',  style: 'bg-green-50 text-green-700' },
  DRAFT:    { label: 'Paused',  style: 'bg-yellow-50 text-yellow-700' },
  CLOSED:   { label: 'Closed',  style: 'bg-gray-100 text-gray-500' },
  EXPIRED:  { label: 'Expired', style: 'bg-gray-100 text-gray-500' },
};

function StatusBtn({ job, onUpdated }: { job: Listing; onUpdated: (id: string, s: JobStatus) => void }) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = job.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    setLoading(true);
    const res = await fetch(`/api/employer/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) onUpdated(job.id, next);
    setLoading(false);
  };

  if (job.status === 'CLOSED' || job.status === 'EXPIRED') return null;
  return (
    <button onClick={toggle} disabled={loading}
      className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
        job.status === 'ACTIVE'
          ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
      )}>
      {loading ? '…' : job.status === 'ACTIVE' ? 'Pause' : 'Activate'}
    </button>
  );
}

export default function ListingsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const { data: nextSession, status: nextStatus } = useSession();
  const clearUser = useAuthStore((s) => s.clearUser);

  const sessionReady = !isLoading && nextStatus !== 'loading';
  const isEmployer =
    (!!user && (user.user_metadata?.role as string ?? '').toUpperCase() === 'EMPLOYER') ||
    (!!nextSession?.user && (nextSession.user.role as string ?? '').toUpperCase() === 'EMPLOYER');

  useEffect(() => {
    if (!sessionReady) return;
    if (!isEmployer) router.replace('/login');
  }, [sessionReady, isEmployer, router]);

  const [jobs,    setJobs]    = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!isEmployer) return;
    setLoading(true);
    fetch('/api/employer/jobs').then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .catch(err => console.error('[listings] fetch error:', err))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (isEmployer) load();
  }, [isEmployer]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdated = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
  };

  const displayName =
    dbUser?.name ??
    user?.email?.split('@')[0] ??
    (nextSession?.user as { name?: string; companyName?: string } | undefined)?.companyName ??
    nextSession?.user?.name ??
    'Employer';

  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  if (!sessionReady || (!isEmployer && sessionReady)) {
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
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">My Listings</h1>
            {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{jobs.length}</span>}
          </div>
          <Link href="/employer/dashboard/post-job"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
            <PlusCircle className="h-4 w-4" /> Post a Job
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['JOB TITLE', 'TYPE', 'APPLICATIONS', 'STATUS', 'POSTED', 'ACTIONS'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 font-medium text-foreground">No jobs posted yet</p>
                <Link href="/employer/dashboard/post-job"
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <PlusCircle className="h-4 w-4" /> Post your first job
                </Link>
              </div>
            ) : jobs.map(job => {
              const info = STATUS_MAP[job.status] ?? STATUS_MAP.CLOSED;
              return (
                <div key={job.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{job.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{job.type.replace('_', '-').toLowerCase()}</span>
                  <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', info.style)}>{info.label}</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/jobs/${job.id}`} target="_blank"
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                    <Link href={`/employer/dashboard/applications?jobId=${job.id}`}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                      Applicants
                    </Link>
                    <StatusBtn job={job} onUpdated={handleUpdated} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
