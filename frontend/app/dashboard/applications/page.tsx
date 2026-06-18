'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, ExternalLink, Trash2, Download, AlertCircle, Loader2, Info, LayoutList, GitBranch } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { StatusChip, mapDbStatus } from '@/components/ui/StatusChip';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface StatusLog {
  id: string;
  status: string;
  changedAt: string;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  rejectionReason?: string | null;
  statusLogs?: StatusLog[];
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
  const [viewMode,      setViewMode]      = useState<'table' | 'timeline'>('table');
  const [withdrawing,   setWithdrawing]   = useState<string | null>(null);
  const [withdrawModal, setWithdrawModal] = useState<{ appId: string; jobTitle: string } | null>(null);
  const [withdrawReason,setWithdrawReason]= useState('');
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

  const openWithdrawModal = (appId: string, jobTitle: string) => {
    setWithdrawReason('');
    setWithdrawModal({ appId, jobTitle });
  };

  const closeWithdrawModal = () => {
    setWithdrawModal(null);
    setWithdrawReason('');
  };

  const confirmWithdraw = async () => {
    if (!withdrawModal || withdrawReason.trim().length < 10) return;
    const { appId } = withdrawModal;
    setWithdrawing(appId);
    try {
      const res = await fetch(`/api/candidate/applications/${appId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: withdrawReason.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
        setTotal(prev => prev - 1);
        closeWithdrawModal();
        addToast({ title: 'Application withdrawn', variant: 'success' });
      } else {
        addToast({ title: data.error ?? 'Failed to withdraw application', variant: 'error' });
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
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
              <button onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <LayoutList className="h-3.5 w-3.5" /> Table
              </button>
              <button onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'timeline' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <GitBranch className="h-3.5 w-3.5" /> Timeline
              </button>
            </div>
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
          {viewMode === 'timeline' && !loading && applications.length > 0 && (
            <div className="space-y-6">
              {applications.map(app => (
                <div key={app.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${tileColor(app.job.company.name)}`}>
                        {app.job.company.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{app.job.title}</p>
                        <p className="text-xs text-muted-foreground">{app.job.company.name} · {app.job.location}</p>
                      </div>
                    </div>
                    <Link href={`/jobs/${app.job.id}`}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                  </div>
                  <div className="px-5 py-4">
                    <div className="relative pl-5">
                      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200" />
                      {[
                        { status: 'APPLIED', changedAt: app.appliedAt, id: 'applied' },
                        ...(app.statusLogs ?? []),
                      ].map((log, i, arr) => {
                        const isLast = i === arr.length - 1;
                        const statusColors: Record<string, string> = {
                          APPLIED:     'bg-blue-500',
                          REVIEWING:   'bg-amber-500',
                          SHORTLISTED: 'bg-purple-500',
                          REJECTED:    'bg-red-500',
                          HIRED:       'bg-green-500',
                        };
                        return (
                          <div key={log.id} className={`relative flex items-start gap-3 ${isLast ? '' : 'mb-4'}`}>
                            <div className={`absolute -left-[13px] mt-1.5 h-3 w-3 rounded-full border-2 border-white ${statusColors[log.status] ?? 'bg-gray-400'}`} />
                            <div>
                              <p className="text-sm font-semibold capitalize text-foreground">
                                {log.status.charAt(0) + log.status.slice(1).toLowerCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {app.status === 'REJECTED' && app.rejectionReason && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <p className="text-xs text-red-600">{app.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && (
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
                  className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4">
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
                        onClick={() => openWithdrawModal(app.id, app.job.title)}
                        disabled={withdrawing === app.id}
                        title="Withdraw application"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                      >
                        {withdrawing === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        {withdrawing === app.id ? '…' : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
                {app.status === 'REJECTED' && app.rejectionReason && (
                  <div className="mx-6 mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <div>
                      <p className="text-xs font-semibold text-red-700">Feedback from employer</p>
                      <p className="mt-0.5 text-xs text-red-600">{app.rejectionReason}</p>
                    </div>
                  </div>
                )}
                </div>
              ))
            )}
          </div>
          )}
        </div>
      </div>
      {/* Withdraw confirmation modal */}
      {withdrawModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={closeWithdrawModal} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-5 w-5 text-danger" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Withdraw Application</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{withdrawModal.jobTitle}</span>
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-foreground">
                Reason for withdrawal <span className="text-danger">*</span>
              </label>
              <textarea
                value={withdrawReason}
                onChange={e => setWithdrawReason(e.target.value)}
                placeholder="Please explain why you are withdrawing this application…"
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <div className="mt-1 flex items-center justify-between">
                <p className={`text-xs ${withdrawReason.trim().length < 10 ? 'text-muted-foreground' : 'text-green-600'}`}>
                  {withdrawReason.trim().length < 10
                    ? `${10 - withdrawReason.trim().length} more character${10 - withdrawReason.trim().length !== 1 ? 's' : ''} required`
                    : 'Reason provided'}
                </p>
                <p className="text-xs text-muted-foreground">{withdrawReason.length} chars</p>
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
              This action is permanent and cannot be undone. You will need to re-apply if you change your mind.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button onClick={closeWithdrawModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-gray-300 hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                disabled={withdrawReason.trim().length < 10 || !!withdrawing}
                className="flex items-center gap-1.5 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-40"
              >
                {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Withdraw Application
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
