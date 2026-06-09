'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { UserCheck, Search, Loader2, ChevronLeft, ChevronRight, FileText, Download, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CandidateProfileDrawer } from '@/components/employer/CandidateProfileDrawer';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface CandidateRow {
  id: string; name: string; email: string; avatar: string | null;
  phone: string | null; isVerified: boolean; createdAt: string;
  _count: { applications: number };
  resume: { fileUrl: string; parsedData: Record<string, unknown> | null } | null;
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

export default function AdminCandidatesPage() {
  const user = useAuthStore((s) => s.user);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [total,       setTotal]      = useState(0);
  const [totalPages,  setTotalPages] = useState(1);
  const [loading,     setLoading]    = useState(true);
  const [q,           setQ]          = useState('');
  const [page,        setPage]       = useState(1);
  const [viewId,      setViewId]     = useState<string | null>(null);
  const [dlMap,       setDlMap]      = useState<Record<string, boolean>>({});
  const { toasts, addToast, dismiss } = useToast();

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set('q', q);
    fetch(`/api/admin/candidates?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: { candidates?: CandidateRow[]; total?: number; totalPages?: number }) => {
        setCandidates(d.candidates ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, q, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const downloadResume = async (candidateId: string, name: string) => {
    setDlMap(prev => ({ ...prev, [candidateId]: true }));
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}/resume`);
      const data = await res.json() as { downloadUrl?: string; error?: string };
      if (data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = `${name.replace(/\s+/g, '_')}_resume.pdf`;
        a.click();
      } else {
        addToast({ title: data.error ?? 'No resume available', variant: 'error' });
      }
    } finally {
      setDlMap(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Candidates</h1>
          {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="w-52 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <button type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {(['CANDIDATE', 'EMAIL', 'APPS', 'RESUME', 'ACTIONS'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserCheck className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No candidates found</p>
              {q && <button onClick={() => { setQ(''); setPage(1); }} className="mt-2 text-sm text-primary hover:underline">Clear search</button>}
            </div>
          ) : candidates.map(c => {
            const skills = (c.resume?.parsedData as { skills?: string[] } | null)?.skills ?? [];
            const hasResume = !!(c.resume?.fileUrl);
            return (
              <div key={c.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${tileColor(c.name)}`}>
                      {c.name[0]?.toUpperCase() ?? '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link href={`/dashboard/admin/users/${c.id}`}
                      className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline">
                      {c.name}
                    </Link>
                    {skills.length > 0 && (
                      <p className="truncate text-xs text-muted-foreground">
                        {skills.slice(0, 3).join(', ')}{skills.length > 3 ? ` +${skills.length - 3}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <p className="truncate text-sm text-muted-foreground">{c.email}</p>
                <p className="text-sm font-medium text-foreground">{c._count.applications}</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${hasResume ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <FileText className="h-3 w-3" /> {hasResume ? 'Uploaded' : 'None'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setViewId(c.id)}
                    className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  {hasResume && (
                    <button onClick={() => downloadResume(c.id, c.name)} disabled={dlMap[c.id]}
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50">
                      {dlMap[c.id] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Resume
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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

      <CandidateProfileDrawer
        candidateId={viewId}
        resumeApiBase="/api/admin/candidates"
        onClose={() => setViewId(null)}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
