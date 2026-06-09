'use client';

import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Search, Loader2, ChevronLeft, ChevronRight, ExternalLink, XCircle, RefreshCw, Download, Trash } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface JobRow {
  id: string; title: string; location: string; type: string;
  status: string; createdAt: string; viewCount?: number;
  reportCount?: number;
  experienceLevel: string;
  company: { name: string; industry?: string | null };
  _count: { applications: number };
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+',
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:  'bg-green-50 text-green-700',
  DRAFT:   'bg-yellow-50 text-yellow-700',
  CLOSED:  'bg-gray-100 text-gray-500',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

export default function AdminJobsPage() {
  const user = useAuthStore((s) => s.user);

  const [jobs,       setJobs]       = useState<JobRow[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [page,       setPage]       = useState(1);
  const [typeFilter,  setTypeFilter]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMap,    setActionMap]    = useState<Record<string, boolean>>({});
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [bulkLoading,  setBulkLoading]  = useState(false);
  const [cleaning,     setCleaning]     = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlQ    = params.get('q')    ?? '';
    const urlPage = Number(params.get('page') ?? 1);
    if (urlQ)     setQ(urlQ);
    if (urlPage > 1) setPage(urlPage);
  }, []);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));
    fetch(`/api/admin/jobs?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d as { jobs?: JobRow[]; total?: number; totalPages?: number };
        setJobs(data.jobs ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [user, q, page, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const handleCleanup = async () => {
    if (!confirm('Close all stale ACTIVE jobs (no applications, not updated in 90+ days)?')) return;
    setCleaning(true);
    try {
      const res = await fetch('/api/admin/jobs/cleanup', { method: 'POST' });
      const d = await res.json() as { closed?: number; error?: string };
      if (res.ok) {
        addToast({ title: `Cleanup complete — ${d.closed} job${d.closed !== 1 ? 's' : ''} closed`, variant: 'success' });
        load();
      } else {
        addToast({ title: d.error ?? 'Cleanup failed', variant: 'error' });
      }
    } finally {
      setCleaning(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === jobs.length && jobs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(jobs.map(j => j.id)));
    }
  };

  const handleBulkStatus = async (status: 'CLOSED' | 'ACTIVE') => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/admin/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          }),
        ),
      );
      setJobs(prev => prev.map(j => selectedIds.has(j.id) ? { ...j, status } : j));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      addToast({ title: `${count} job${count !== 1 ? 's' : ''} ${status === 'CLOSED' ? 'closed' : 'reopened'}`, variant: 'success' });
    } finally {
      setBulkLoading(false);
    }
  };

  const updateJobStatus = async (id: string, status: string) => {
    setActionMap(prev => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
      addToast({ title: status === 'CLOSED' ? 'Job removed' : 'Job reopened', variant: 'success' });
    } else {
      addToast({ title: 'Failed to update job status', variant: 'error' });
    }
    setActionMap(prev => ({ ...prev, [id]: false }));
  };

  return (
    <>
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Jobs</h1>
            {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search title, company…"
                  className="w-44 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              </div>
              <button type="submit"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                Search
              </button>
            </form>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="REMOTE">Remote</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <button onClick={handleCleanup} disabled={cleaning}
              className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50">
              {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
              Run Cleanup
            </button>
            <a
              href="/api/admin/export?type=jobs"
              download
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <span className="text-sm font-semibold text-foreground">
              {selectedIds.size} job{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button onClick={() => handleBulkStatus('CLOSED')} disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Close all
            </button>
            <button onClick={() => handleBulkStatus('ACTIVE')} disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Reopen all
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground">
              Clear selection
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[auto_2fr_1.2fr_1fr_0.8fr_1fr_0.6fr_0.8fr_1fr_auto] gap-3 border-b border-gray-100 px-6 py-3">
            <input type="checkbox"
              checked={jobs.length > 0 && selectedIds.size === jobs.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-primary cursor-pointer"
              title="Select all"
            />
            {(['JOB TITLE', 'COMPANY', 'TYPE', 'VIEWS', 'APPS', 'REPORTS', 'STATUS', 'POSTED', 'ACTIONS'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No jobs found</p>
              {q && <button onClick={() => { setQ(''); setPage(1); }} className="mt-2 text-sm text-primary hover:underline">Clear search</button>}
            </div>
          ) : jobs.map(job => (
            <div key={job.id}
              className="grid grid-cols-[auto_2fr_1.2fr_1fr_0.8fr_1fr_0.6fr_0.8fr_1fr_auto] items-center gap-3 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <input type="checkbox"
                checked={selectedIds.has(job.id)}
                onChange={() => toggleSelect(job.id)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${tileColor(job.company.name)}`}>
                  {job.company.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{job.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{job.location}</p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
                {job.company.industry && (
                  <p className="truncate text-[10px] text-muted-foreground/60">{job.company.industry}</p>
                )}
              </div>
              <div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {TYPE_LABELS[job.type] ?? job.type}
                </span>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">{EXP_LABELS[job.experienceLevel] ?? job.experienceLevel}</p>
              </div>
              <p className="text-sm font-medium text-foreground">{job.viewCount ?? 0}</p>
              <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
              {(job.reportCount ?? 0) > 0
                ? <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{job.reportCount}</span>
                : <span className="text-sm text-muted-foreground">—</span>
              }
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-500')}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </span>
              <p className="text-sm text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              <div className="flex items-center gap-1.5">
                <Link href={`/jobs/${job.id}`} target="_blank"
                  className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <ExternalLink className="h-3 w-3" /> View
                </Link>
                {job.status === 'ACTIVE' && (
                  <button onClick={() => updateJobStatus(job.id, 'CLOSED')} disabled={actionMap[job.id]}
                    className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                    {actionMap[job.id] && <Loader2 className="h-3 w-3 animate-spin" />}
                    Remove
                  </button>
                )}
                {(job.status === 'CLOSED' || job.status === 'DRAFT') && (
                  <button onClick={() => updateJobStatus(job.id, 'ACTIVE')} disabled={actionMap[job.id]}
                    className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50">
                    {actionMap[job.id] && <Loader2 className="h-3 w-3 animate-spin" />}
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
