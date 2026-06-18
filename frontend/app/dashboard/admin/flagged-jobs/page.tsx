'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ExternalLink, XCircle, RefreshCw, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  reporter: { name: string; email: string };
}

interface FlaggedJob {
  id: string;
  title: string;
  location: string;
  status: string;
  createdAt: string;
  company: { name: string };
  reportCount: number;
  reports?: Report[];
  expanded?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:  'bg-green-50 text-green-700',
  DRAFT:   'bg-yellow-50 text-yellow-700',
  CLOSED:  'bg-gray-100 text-gray-500',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FlaggedJobsPage() {
  const user = useAuthStore((s) => s.user);

  const [jobs,       setJobs]       = useState<FlaggedJob[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [actionMap,  setActionMap]  = useState<Record<string, boolean>>({});
  const { toasts, addToast, dismiss } = useToast();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/jobs?reported=true&pageSize=100&sort=date&order=desc');
      const d = await res.json() as { jobs?: FlaggedJob[]; total?: number };
      const sorted = (d.jobs ?? []).sort((a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0));
      setJobs(sorted.map(j => ({ ...j, expanded: false })));
      setTotal(d.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (!job.reports) {
      setActionMap(m => ({ ...m, [`exp_${jobId}`]: true }));
      try {
        const res = await fetch(`/api/admin/jobs/${jobId}`);
        if (res.ok) {
          const detail = await res.json() as { reports?: Report[] };
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, reports: detail.reports ?? [], expanded: true } : j));
        }
      } finally {
        setActionMap(m => ({ ...m, [`exp_${jobId}`]: false }));
      }
    } else {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, expanded: !j.expanded } : j));
    }
  };

  const closeJob = async (jobId: string) => {
    setActionMap(m => ({ ...m, [`close_${jobId}`]: true }));
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'CLOSED' } : j));
        addToast({ title: 'Job closed', variant: 'success' });
      } else {
        addToast({ title: 'Failed to close job', variant: 'error' });
      }
    } finally {
      setActionMap(m => ({ ...m, [`close_${jobId}`]: false }));
    }
  };

  const dismissReports = async (jobId: string) => {
    setActionMap(m => ({ ...m, [`dismiss_${jobId}`]: true }));
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/reports`, { method: 'DELETE' });
      const d = await res.json() as { dismissed?: number; error?: string };
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setTotal(t => t - 1);
        addToast({ title: `${d.dismissed} report${d.dismissed !== 1 ? 's' : ''} dismissed`, variant: 'success' });
      } else {
        addToast({ title: d.error ?? 'Failed to dismiss reports', variant: 'error' });
      }
    } finally {
      setActionMap(m => ({ ...m, [`dismiss_${jobId}`]: false }));
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h1 className="font-semibold text-foreground">Flagged Jobs</h1>
          {!loading && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{total}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load()} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <Link href="/dashboard/admin/jobs"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
            All Jobs
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Jobs with at least one abuse report, sorted by report count. Review and close or dismiss reports.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <AlertTriangle className="h-6 w-6 text-green-500" />
            </div>
            <p className="mt-3 font-semibold text-foreground">No flagged jobs</p>
            <p className="mt-1 text-sm text-muted-foreground">All clear — no jobs have pending reports.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
                {/* Job row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${tileColor(job.company.name)}`}>
                    {job.company.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{job.title}</p>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-500')}>
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {job.reportCount} report{job.reportCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {job.company.name} · {job.location} · Posted {fmtDate(job.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => toggleExpand(job.id)} disabled={actionMap[`exp_${job.id}`]}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                      {actionMap[`exp_${job.id}`]
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : job.expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      Reports
                    </button>
                    <Link href={`/jobs/${job.id}`} target="_blank"
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                    {job.status === 'ACTIVE' && (
                      <button onClick={() => closeJob(job.id)} disabled={actionMap[`close_${job.id}`]}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                        {actionMap[`close_${job.id}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                        Close
                      </button>
                    )}
                    <button onClick={() => dismissReports(job.id)} disabled={actionMap[`dismiss_${job.id}`]}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                      {actionMap[`dismiss_${job.id}`] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Dismiss All
                    </button>
                  </div>
                </div>

                {/* Expanded reports */}
                {job.expanded && job.reports && job.reports.length > 0 && (
                  <div className="border-t border-red-100 bg-red-50/30 px-5 py-3 space-y-2">
                    {job.reports.map(r => (
                      <div key={r.id} className="rounded-lg border border-red-100 bg-white px-4 py-3">
                        <p className="text-sm font-medium text-foreground">&ldquo;{r.reason}&rdquo;</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Reported by {r.reporter.name} ({r.reporter.email}) · {fmtDate(r.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
