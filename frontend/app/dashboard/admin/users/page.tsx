'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Search, Loader2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface UserRow {
  id: string; name: string; email: string; role: string;
  isVerified: boolean; createdAt: string;
  _count: { applications: number };
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

const ROLE_STYLES: Record<string, string> = {
  CANDIDATE: 'bg-blue-50 text-blue-700',
  EMPLOYER:  'bg-violet-50 text-violet-700',
  ADMIN:     'bg-primary/10 text-primary',
};

export default function AdminUsersPage() {
  const user = useAuthStore((s) => s.user);

  const [users,      setUsers]      = useState<UserRow[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [page,       setPage]       = useState(1);
  const [actionMap,  setActionMap]  = useState<Record<string, boolean>>({});
  const [deleteMap,  setDeleteMap]  = useState<Record<string, boolean>>({});

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
    params.set('page', String(page));
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        const data = d as { users?: UserRow[]; total?: number; totalPages?: number };
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [user, q, page]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setDeleteMap(prev => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setTotal(prev => prev - 1);
    } else {
      const data = await res.json() as { error?: string };
      alert(data.error ?? 'Failed to delete user');
    }
    setDeleteMap(prev => ({ ...prev, [id]: false }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const toggleUser = async (id: string, currentlyVerified: boolean) => {
    setActionMap(prev => ({ ...prev, [id]: true }));
    const action = currentlyVerified ? 'suspend' : 'restore';
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: !currentlyVerified } : u));
    }
    setActionMap(prev => ({ ...prev, [id]: false }));
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Users</h1>
          {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name or email…"
              className="w-52 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
            Search
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {(['USER', 'EMAIL', 'ROLE', 'APPS', 'STATUS', 'ACTIONS'] as const).map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No users found</p>
              {q && <button onClick={() => { setQ(''); setPage(1); }} className="mt-2 text-sm text-primary hover:underline">Clear search</button>}
            </div>
          ) : users.map(u => (
            <div key={u.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(u.name)}`}>
                  {u.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', ROLE_STYLES[u.role] ?? 'bg-gray-100 text-gray-600')}>
                {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
              </span>
              <p className="text-sm font-medium text-foreground">{u._count.applications}</p>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                u.isVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>
                {u.isVerified ? 'Active' : 'Suspended'}
              </span>
              <div className="flex items-center gap-1.5">
                {u.role !== 'ADMIN' && (
                  <>
                    <button
                      onClick={() => toggleUser(u.id, u.isVerified)}
                      disabled={actionMap[u.id]}
                      className={cn(
                        'flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                        u.isVerified
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                      )}
                    >
                      {actionMap[u.id] && <Loader2 className="h-3 w-3 animate-spin" />}
                      {u.isVerified ? 'Suspend' : 'Restore'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      disabled={deleteMap[u.id]}
                      className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      title="Delete account permanently"
                    >
                      {deleteMap[u.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </>
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
    </>
  );
}
