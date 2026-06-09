'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, Search, Loader2, ExternalLink, BadgeCheck, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { AddCompanyModal, type CompanyRow } from '@/components/admin/AddCompanyModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

export default function AdminCompaniesPage() {

  const user = useAuthStore((s) => s.user);
  const [companies,   setCompanies]   = useState<CompanyRow[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [q,           setQ]           = useState('');
  const [page,        setPage]        = useState(1);
  const [actionMap,   setActionMap]   = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const { toasts, addToast, dismiss } = useToast();

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('page', String(page));
    fetch(`/api/admin/companies?${params}`)
      .then(r => r.json())
      .then((d: { companies?: CompanyRow[]; total?: number; totalPages?: number }) => {
        setCompanies(d.companies ?? []);
        setTotal(d.total ?? 0);
        setTotalPages(d.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [user, q, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const toggleVerified = async (id: string, current: boolean) => {
    setActionMap(prev => ({ ...prev, [id]: true }));
    const res = await fetch('/api/admin/companies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isVerified: !current }),
    });
    if (res.ok) {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, isVerified: !current } : c));
      addToast({ title: current ? 'Verification removed' : 'Company verified', variant: 'success' });
    } else {
      addToast({ title: 'Failed to update verification', variant: 'error' });
    }
    setActionMap(prev => ({ ...prev, [id]: false }));
  };

  const deleteCompany = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its jobs? This cannot be undone.`)) return;
    setActionMap(prev => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/admin/companies?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      addToast({ title: `"${name}" deleted`, variant: 'success' });
    } else {
      addToast({ title: 'Failed to delete company', variant: 'error' });
    }
    setActionMap(prev => ({ ...prev, [id]: false }));
  };

  return (
    <>
      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onCreated={(co) => { setCompanies(prev => [co, ...prev]); setTotal(prev => prev + 1); addToast({ title: `Company "${co.name}" created`, variant: 'success' }); }}
        />
      )}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Companies</h1>
          {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search name or industry…"
              className="w-52 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
          </div>
          <button type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Company
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {(['COMPANY', 'OWNER', 'INDUSTRY', 'JOBS', 'VERIFIED', 'ACTIONS'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No companies found</p>
            </div>
          ) : companies.map(co => (
            <div key={co.id}
              className="grid grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{co.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{co.size ?? '—'} employees</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{co.owner.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{co.owner.email}</p>
              </div>
              <p className="truncate text-sm text-muted-foreground">{co.industry ?? '—'}</p>
              <p className="text-sm font-medium text-foreground">{co._count.jobs}</p>
              <button
                onClick={() => toggleVerified(co.id, co.isVerified)}
                disabled={actionMap[co.id]}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50',
                  co.isVerified ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}>
                {actionMap[co.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <BadgeCheck className="h-3 w-3" />}
                {co.isVerified ? 'Verified' : 'Unverified'}
              </button>
              <div className="flex items-center gap-1.5">
                <Link href={`/companies/${co.id}`} target="_blank"
                  className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <ExternalLink className="h-3 w-3" /> View
                </Link>
                <button onClick={() => deleteCompany(co.id, co.name)} disabled={actionMap[co.id]}
                  className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                  {actionMap[co.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Delete
                </button>
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
