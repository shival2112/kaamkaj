'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Briefcase, Search, Loader2, ChevronLeft, ChevronRight,
  ExternalLink, XCircle, RefreshCw, Download, Trash,
  Zap, X, ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useToast, ToastContainer } from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobRow {
  id: string; title: string; location: string; type: string;
  status: string; createdAt: string; viewCount?: number;
  reportCount?: number; experienceLevel: string;
  isUrgent: boolean;
  description?: string;
  salaryMin?: number | null; salaryMax?: number | null;
  skills?: string[];
  expiresAt?: string | null;
  company: { name: string; industry?: string | null };
  _count: { applications: number };
}

function jobQualityScore(job: JobRow): number {
  let score = 0;
  if ((job.salaryMin ?? 0) > 0 || (job.salaryMax ?? 0) > 0) score += 25;
  if ((job.skills?.length ?? 0) > 0) score += 25;
  if ((job.description?.length ?? 0) > 200) score += 25;
  if (job.expiresAt) score += 25;
  return score;
}

interface JobDetail {
  id: string; title: string; description: string; location: string;
  type: string; experienceLevel: string; status: string;
  isUrgent: boolean; salaryMin: number | null; salaryMax: number | null;
  vacancies: number; skills: string[]; expiresAt: string | null;
  createdAt: string; viewCount: number;
  company: { name: string; industry: string | null; website: string | null };
  appsByStatus: Record<string, number>;
  reports: { id: string; reason: string; createdAt: string; reporter: { name: string; email: string } }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};
const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+',
};
const APP_STATUS: Record<string, { label: string; cls: string }> = {
  APPLIED:     { label: 'Applied',     cls: 'bg-blue-100 text-blue-700' },
  REVIEWING:   { label: 'Reviewing',   cls: 'bg-amber-100 text-amber-700' },
  SHORTLISTED: { label: 'Shortlisted', cls: 'bg-purple-100 text-purple-700' },
  REJECTED:    { label: 'Rejected',    cls: 'bg-red-100 text-red-600' },
  HIRED:       { label: 'Hired',       cls: 'bg-green-100 text-green-700' },
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

function fmtSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not disclosed';
  const fmt = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Job Detail Drawer ─────────────────────────────────────────────────────────

function JobDetailDrawer({
  data, loading, onClose, onToggleUrgent, urgentLoading, onDelete, deleteLoading,
}: {
  data: JobDetail | null;
  loading: boolean;
  onClose: () => void;
  onToggleUrgent: (id: string, current: boolean) => void;
  urgentLoading: boolean;
  onDelete: (id: string) => void;
  deleteLoading: boolean;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const totalApps = data ? Object.values(data.appsByStatus).reduce((s, v) => s + v, 0) : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4">
          {loading || !data ? (
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <div className="min-w-0 flex-1 pr-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-base font-bold text-foreground">{data.title}</h2>
                <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLES[data.status] ?? 'bg-gray-100 text-gray-500')}>
                  {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
                </span>
                {data.isUrgent && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                    <Zap className="h-2.5 w-2.5" /> URGENT
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {data.company.name} · {data.location} · {TYPE_LABELS[data.type] ?? data.type} · {EXP_LABELS[data.experienceLevel] ?? data.experienceLevel}
              </p>
            </div>
          )}
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {loading || !data ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-4">
              {[
                { label: 'Views',        value: data.viewCount },
                { label: 'Applications', value: totalApps },
                { label: 'Vacancies',    value: data.vacancies },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Salary</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{fmtSalary(data.salaryMin, data.salaryMax)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Posted</p>
                <p className="mt-0.5 text-xs font-medium text-foreground">{fmtDate(data.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Expires</p>
                <p className="mt-0.5 text-xs font-medium text-foreground">
                  {data.expiresAt ? fmtDate(data.expiresAt) : '—'}
                </p>
              </div>
            </div>

            {/* Urgent flag toggle */}
            <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Urgent Flag</p>
                <p className="text-xs text-muted-foreground">
                  {data.isUrgent ? 'Currently boosted — shown as urgent in listings.' : 'Flag to boost visibility on the jobs page.'}
                </p>
              </div>
              <button
                onClick={() => onToggleUrgent(data.id, data.isUrgent)}
                disabled={urgentLoading}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
                  data.isUrgent
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600'
                )}
              >
                {urgentLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                {data.isUrgent ? 'Remove Urgent' : 'Mark Urgent'}
              </button>
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Skills Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map(s => (
                    <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Job Description</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{data.description}</p>
            </div>

            {/* Applications breakdown */}
            {totalApps > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Applications Breakdown ({totalApps})
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(APP_STATUS).map(([key, { label, cls }]) => {
                    const count = data.appsByStatus[key] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={key} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5', cls)}>
                        <span className="text-sm font-bold">{count}</span>
                        <span className="text-xs">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reports */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Reports ({data.reports.length})
              </p>
              {data.reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reports filed.</p>
              ) : (
                <div className="space-y-2">
                  {data.reports.map(r => (
                    <div key={r.id} className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">&ldquo;{r.reason}&rdquo;</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {r.reporter.name} · {r.reporter.email} · {fmtDate(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="rounded-xl border border-red-200 bg-red-50/40 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> Danger Zone
                  </p>
                  <p className="text-xs text-muted-foreground">Permanently removes this job and all its applications.</p>
                </div>
                <button
                  onClick={() => onDelete(data.id)}
                  disabled={deleteLoading}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50"
                >
                  {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />}
                  Delete Job
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const user = useAuthStore((s) => s.user);

  const [jobs,        setJobs]        = useState<JobRow[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [q,           setQ]           = useState('');
  const [page,        setPage]        = useState(1);
  const [typeFilter,  setTypeFilter]  = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [sortBy,      setSortBy]      = useState<'date' | 'views' | 'apps'>('date');
  const [sortOrder,   setSortOrder]   = useState<'asc' | 'desc'>('desc');
  const [actionMap,   setActionMap]   = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [cleaning,    setCleaning]    = useState(false);
  const [pageSize,    setPageSize]    = useState<10 | 20 | 50 | 100>(20);
  const [jumpPage,    setJumpPage]    = useState('');
  const [expLevel,    setExpLevel]    = useState('');
  const [days,        setDays]        = useState(0);
  const [urgentOnly,  setUrgentOnly]  = useState(false);
  const [hasReports,  setHasReports]  = useState(false);
  const [stats,       setStats]       = useState<Record<string, number>>({});

  // Drawer state
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerJobId,   setDrawerJobId]   = useState<string | null>(null);
  const [drawerData,    setDrawerData]    = useState<JobDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

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
    if (q)          params.set('q', q);
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    if (expLevel)   params.set('exp', expLevel);
    if (days > 0)   params.set('days', String(days));
    if (urgentOnly) params.set('urgent', 'true');
    if (hasReports) params.set('reported', 'true');
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    params.set('sort', sortBy);
    params.set('order', sortOrder);
    fetch(`/api/admin/jobs?${params}`)
      .then(async r => {
        const d = await r.json() as { jobs?: JobRow[]; total?: number; totalPages?: number; stats?: Record<string, number>; error?: string };
        if (!r.ok) {
          setApiError(d.error ?? `Error ${r.status}`);
          setJobs([]); setTotal(0);
          return;
        }
        setApiError(null);
        setJobs(d.jobs ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
        if (d.stats) setStats(d.stats);
      })
      .finally(() => setLoading(false));
  }, [user, q, page, pageSize, typeFilter, statusFilter, expLevel, days, urgentOnly, hasReports, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const handleSort = (col: 'date' | 'views' | 'apps') => {
    if (col === sortBy) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortOrder('desc'); }
    setPage(1);
  };

  // ── Drawer ──────────────────────────────────────────────────────────────────

  const openDrawer = async (jobId: string) => {
    setDrawerOpen(true);
    setDrawerJobId(jobId);
    setDrawerData(null);
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`);
      if (res.ok) setDrawerData(await res.json() as JobDetail);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerJobId(null);
    setDrawerData(null);
  };

  // ── Actions ─────────────────────────────────────────────────────────────────

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
    if (selectedIds.size === jobs.length && jobs.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(jobs.map(j => j.id)));
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

  const toggleUrgent = async (id: string, current: boolean) => {
    const key = `urg_${id}`;
    setActionMap(prev => ({ ...prev, [key]: true }));
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUrgent: !current }),
    });
    if (res.ok) {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isUrgent: !current } : j));
      setDrawerData(prev => prev?.id === id ? { ...prev, isUrgent: !current } : prev);
      addToast({ title: !current ? 'Marked as urgent' : 'Urgent flag removed', variant: 'success' });
    } else {
      addToast({ title: 'Failed to update urgent flag', variant: 'error' });
    }
    setActionMap(prev => ({ ...prev, [key]: false }));
  };

  const resetFilters = () => {
    setQ(''); setTypeFilter(''); setStatusFilter('');
    setExpLevel(''); setDays(0); setUrgentOnly(false); setHasReports(false);
    setPage(1);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} job${selectedIds.size !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' })));
      const count = selectedIds.size;
      setJobs(prev => prev.filter(j => !selectedIds.has(j.id)));
      setTotal(prev => prev - count);
      setSelectedIds(new Set());
      addToast({ title: `${count} job${count !== 1 ? 's' : ''} permanently deleted`, variant: 'success' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUrgent = async (markUrgent: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/admin/jobs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isUrgent: markUrgent }),
          }),
        ),
      );
      setJobs(prev => prev.map(j => selectedIds.has(j.id) ? { ...j, isUrgent: markUrgent } : j));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      addToast({ title: `${count} job${count !== 1 ? 's' : ''} ${markUrgent ? 'marked urgent' : 'urgent flag cleared'}`, variant: 'success' });
    } finally {
      setBulkLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Permanently delete this job? This cannot be undone.')) return;
    setActionMap(prev => ({ ...prev, [`del_${id}`]: true }));
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        setTotal(prev => prev - 1);
        closeDrawer();
        addToast({ title: 'Job permanently deleted', variant: 'success' });
      } else {
        addToast({ title: 'Failed to delete job', variant: 'error' });
      }
    } finally {
      setActionMap(prev => ({ ...prev, [`del_${id}`]: false }));
    }
  };

  // ── Sort header helper ──────────────────────────────────────────────────────

  const SortIcon = ({ col }: { col: 'date' | 'views' | 'apps' }) => {
    if (sortBy !== col) return <span className="opacity-30">↕</span>;
    return sortOrder === 'desc' ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />;
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
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none">
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="REMOTE">Remote</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select value={expLevel} onChange={e => { setExpLevel(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none">
              <option value="">All Levels</option>
              <option value="FRESHER">Fresher</option>
              <option value="JUNIOR">Junior (1–3y)</option>
              <option value="MID">Mid (3–6y)</option>
              <option value="SENIOR">Senior (6–10y)</option>
              <option value="LEAD">Lead (10+y)</option>
            </select>
            <select value={days} onChange={e => { setDays(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-foreground focus:outline-none">
              <option value={0}>Any time</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={() => { setUrgentOnly(v => !v); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors',
                urgentOnly
                  ? 'border-orange-300 bg-orange-100 text-orange-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-orange-200 hover:text-orange-600'
              )}
            >
              <Zap className="h-3.5 w-3.5" /> Urgent
            </button>
            <button
              onClick={() => { setHasReports(v => !v); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors',
                hasReports
                  ? 'border-red-300 bg-red-100 text-red-700'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-red-200 hover:text-red-600'
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Reported
            </button>
            {(q || typeFilter || statusFilter || expLevel || days > 0 || urgentOnly || hasReports) && (
              <button onClick={resetFilters}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
            <button onClick={handleCleanup} disabled={cleaning}
              className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50">
              {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
              Run Cleanup
            </button>
            <a href="/api/admin/export?type=jobs" download
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-colors">
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats strip */}
        {Object.keys(stats).length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {[
              { key: 'ACTIVE',   label: 'Active',    cls: 'bg-green-50 text-green-700 border-green-200',   filter: () => { setStatusFilter('ACTIVE');   setPage(1); } },
              { key: 'CLOSED',   label: 'Closed',    cls: 'bg-gray-100 text-gray-600 border-gray-200',     filter: () => { setStatusFilter('CLOSED');   setPage(1); } },
              { key: 'DRAFT',    label: 'Draft',     cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', filter: () => { setStatusFilter('DRAFT');    setPage(1); } },
              { key: 'EXPIRED',  label: 'Expired',   cls: 'bg-gray-100 text-gray-500 border-gray-200',     filter: () => { setStatusFilter('EXPIRED');  setPage(1); } },
              { key: 'reported', label: 'Reported',  cls: 'bg-red-50 text-red-600 border-red-200',         filter: () => { setHasReports(true);         setPage(1); } },
            ].map(({ key, label, cls, filter }) => stats[key] ? (
              <button key={key} onClick={filter}
                className={cn('rounded-full border px-3 py-0.5 text-xs font-semibold transition-opacity hover:opacity-75', cls)}>
                {label}: {stats[key]}
              </button>
            ) : null)}
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
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
            <button onClick={() => handleBulkUrgent(true)} disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Mark urgent
            </button>
            <button onClick={() => handleBulkUrgent(false)} disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Clear urgent
            </button>
            <button onClick={handleBulkDelete} disabled={bulkLoading}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50">
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />}
              Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground">
              Clear selection
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[auto_2fr_1.2fr_1fr_0.8fr_1fr_0.6fr_0.6fr_0.8fr_1fr_auto] gap-3 border-b border-gray-100 px-6 py-3">
            <input type="checkbox"
              checked={jobs.length > 0 && selectedIds.size === jobs.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-primary cursor-pointer"
              title="Select all"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Job Title</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
            <button onClick={() => handleSort('views')}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Views <SortIcon col="views" />
            </button>
            <button onClick={() => handleSort('apps')}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Apps <SortIcon col="apps" />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Reports</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quality</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <button onClick={() => handleSort('date')}
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              Posted <SortIcon col="date" />
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : apiError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-semibold text-red-600">Failed to load jobs</p>
              <p className="mt-1 text-sm text-muted-foreground">{apiError}</p>
              <button onClick={load} className="mt-3 rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90">Retry</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No jobs found</p>
              {q && <button onClick={() => { setQ(''); setPage(1); }} className="mt-2 text-sm text-primary hover:underline">Clear search</button>}
            </div>
          ) : jobs.map(job => (
            <div key={job.id}
              className={cn(
                'grid grid-cols-[auto_2fr_1.2fr_1fr_0.8fr_1fr_0.6fr_0.6fr_0.8fr_1fr_auto] items-center gap-3 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors',
                drawerJobId === job.id && 'bg-primary/5'
              )}>
              <input type="checkbox"
                checked={selectedIds.has(job.id)}
                onChange={() => toggleSelect(job.id)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              {/* Title column — click to open detail drawer */}
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${tileColor(job.company.name)}`}>
                  {job.company.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <button
                    onClick={() => openDrawer(job.id)}
                    className="flex items-center gap-1.5 text-left text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {job.title}
                    {job.isUrgent && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-600">
                        <Zap className="h-2 w-2" /> URGENT
                      </span>
                    )}
                  </button>
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
              <div>
                <p className="text-sm font-medium text-foreground">{job._count.applications}</p>
                {(job.viewCount ?? 0) > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {((job._count.applications / (job.viewCount ?? 1)) * 100).toFixed(0)}% CVR
                  </p>
                )}
              </div>
              {(job.reportCount ?? 0) > 0
                ? <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">{job.reportCount}</span>
                : <span className="text-sm text-muted-foreground">—</span>
              }
              {(() => {
                const q = jobQualityScore(job);
                const cls = q === 100 ? 'bg-green-50 text-green-700' : q >= 75 ? 'bg-blue-50 text-blue-700' : q >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600';
                return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', cls)}>{q}%</span>;
              })()}
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-500')}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </span>
              <p className="text-sm text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              <div className="flex items-center gap-1">
                <Link href={`/jobs/${job.id}`} target="_blank"
                  className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <ExternalLink className="h-3 w-3" /> View
                </Link>
                <button
                  onClick={() => toggleUrgent(job.id, job.isUrgent)}
                  disabled={actionMap[`urg_${job.id}`]}
                  title={job.isUrgent ? 'Remove urgent flag' : 'Mark as urgent'}
                  className={cn(
                    'flex items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                    job.isUrgent
                      ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : 'border-gray-200 text-gray-400 hover:border-orange-200 hover:text-orange-500'
                  )}
                >
                  {actionMap[`urg_${job.id}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                </button>
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Per page:</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value) as 10 | 20 | 50 | 100); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-foreground focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {/* Page navigation */}
          <div className="flex items-center gap-2">
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
          {/* Jump to page */}
          {totalPages > 2 && (
            <form
              onSubmit={e => { e.preventDefault(); const v = Number(jumpPage); if (v >= 1 && v <= totalPages) { setPage(v); setJumpPage(''); } }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">Go to:</span>
              <input
                type="number" min={1} max={totalPages} value={jumpPage}
                onChange={e => setJumpPage(e.target.value)}
                className="w-14 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-center text-xs text-foreground focus:outline-none"
                placeholder="pg"
              />
              <button type="submit"
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-foreground hover:bg-gray-100 transition-colors">
                Go
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Job detail drawer */}
      {drawerOpen && (
        <JobDetailDrawer
          data={drawerData}
          loading={drawerLoading}
          onClose={closeDrawer}
          onToggleUrgent={toggleUrgent}
          urgentLoading={actionMap[`urg_${drawerJobId}`] ?? false}
          onDelete={deleteJob}
          deleteLoading={actionMap[`del_${drawerJobId}`] ?? false}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
