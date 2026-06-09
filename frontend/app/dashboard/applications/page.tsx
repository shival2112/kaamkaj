'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, ExternalLink, Trash2, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { StatusChip, mapDbStatus } from '@/components/ui/StatusChip';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: { id: string; title: string; location: string; type: string; company: { name: string } };
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const { data: nextSession, status: nextStatus } = useSession();
  const clearUser = useAuthStore((s) => s.clearUser);

  const sessionReady = !isLoading && nextStatus !== 'loading';
  const isCandidate =
    (!!user && (user.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase() === 'CANDIDATE') ||
    (!!nextSession?.user && (nextSession.user.role as string ?? '').toUpperCase() === 'CANDIDATE') ||
    (!!user && !(user.user_metadata?.role));

  useEffect(() => {
    if (!sessionReady) return;
    if (!isCandidate) router.replace('/login');
  }, [sessionReady, isCandidate, router]);

  const [applications,  setApplications]  = useState<Application[]>([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [withdrawing,   setWithdrawing]   = useState<string | null>(null);
  const [exporting,     setExporting]     = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    if (!isCandidate) return;
    fetch('/api/candidate/applications?limit=50')
      .then(r => r.json())
      .then(data => { setApplications((data as { applications?: Application[] }).applications ?? []); setTotal((data as { total?: number }).total ?? 0); })
      .catch(err => console.error('[applications] fetch error:', err))
      .finally(() => setLoading(false));
  }, [isCandidate]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? nextSession?.user?.name ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Withdraw this application? This cannot be undone.')) return;
    setWithdrawing(appId);
    try {
      const res = await fetch(`/api/candidate/applications/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
        setTotal(prev => prev - 1);
        addToast({ title: 'Application withdrawn', variant: 'success' });
      } else {
        addToast({ title: 'Failed to withdraw application', variant: 'error' });
      }
    } finally {
      setWithdrawing(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/candidate/applications/export');
      if (!res.ok) { addToast({ title: 'Export failed', variant: 'error' }); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'my-applications.csv';
      a.click();
      URL.revokeObjectURL(url);
      addToast({ title: 'CSV downloaded', variant: 'success' });
    } catch {
      addToast({ title: 'Export failed', variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  if (!sessionReady) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isCandidate) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">My Applications</h1>
            {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={exporting || loading || total === 0}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40">
              <Download className="h-4 w-4" />{exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <Link href="/jobs"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
              Browse Jobs
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['JOB', 'TYPE', 'STAGE', 'APPLIED', 'ACTIONS'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 font-medium text-foreground">No applications yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Start applying to jobs to track them here</p>
                <Link href="/jobs" className="mt-4 text-sm font-medium text-primary hover:underline">Browse jobs →</Link>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${tileColor(app.job.company.name)}`}>
                      {app.job.company.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{app.job.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{app.job.company.name} · {app.job.location}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {app.job.type.replace('_', '-').toLowerCase()}
                  </span>
                  <StatusChip status={mapDbStatus(app.status)} />
                  <p className="text-sm text-muted-foreground">
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link href={`/jobs/${app.job.id}`}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                    {['APPLIED', 'REVIEWING'].includes(app.status) && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawing === app.id}
                        title="Withdraw application"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        {withdrawing === app.id ? '…' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
