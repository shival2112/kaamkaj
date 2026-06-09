'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Search, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface ReviewRow {
  id: string; rating: number; title: string; body: string | null; createdAt: string;
  company:   { id: string; name: string };
  candidate: { id: string; name: string };
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= n ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const [reviews,    setReviews]    = useState<ReviewRow[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [page,       setPage]       = useState(1);
  const [deleting,   setDeleting]   = useState<Record<string, boolean>>({});
  const { toasts, addToast, dismiss } = useToast();

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', String(page));
    fetch(`/api/admin/reviews?${params}`)
      .then(r => r.json())
      .then((d: { reviews?: ReviewRow[]; total?: number; totalPages?: number }) => {
        setReviews(d.reviews ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [user, q, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently?')) return;
    setDeleting(p => ({ ...p, [id]: true }));
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setReviews(p => p.filter(r => r.id !== id));
      addToast({ title: 'Review deleted', variant: 'success' });
    } else {
      addToast({ title: 'Failed to delete review', variant: 'error' });
    }
    setDeleting(p => ({ ...p, [id]: false }));
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Company Reviews</h1>
          {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
        </div>
        <form onSubmit={e => { e.preventDefault(); setPage(1); load(); }} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search company or candidate…"
              className="w-52 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {(['REVIEW', 'COMPANY', 'CANDIDATE', 'RATING', 'ACTION'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No reviews found</p>
            </div>
          ) : reviews.map(rv => (
            <div key={rv.id}
              className="grid grid-cols-[2fr_1fr_1fr_0.7fr_auto] items-start gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{rv.title}</p>
                {rv.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{rv.body}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(rv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Link href={`/companies/${rv.company.id}`} target="_blank"
                className="truncate text-sm text-primary hover:underline">{rv.company.name}
              </Link>
              <p className="truncate text-sm text-muted-foreground">{rv.candidate.name}</p>
              <Stars n={rv.rating} />
              <button onClick={() => handleDelete(rv.id)} disabled={deleting[rv.id]}
                className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                {deleting[rv.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                Delete
              </button>
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
