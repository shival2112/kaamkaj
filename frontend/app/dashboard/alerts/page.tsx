'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Plus, Trash2, Loader2, Search, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useToast, ToastContainer } from '@/components/ui/Toast';

interface Alert { id: string; keywords: string; location: string; createdAt: string }

export default function AlertsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore(s => s.clearUser);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  const [alerts,    setAlerts]    = useState<Alert[]>([]);
  const [fetching,  setFetching]  = useState(true);
  const [keywords,  setKeywords]  = useState('');
  const [location,  setLocation]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);
  const [error,     setError]     = useState('');
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    if (!user) return;
    fetch('/api/candidate/alerts')
      .then(r => r.json())
      .then((d: { alerts?: Alert[] }) => setAlerts(d.alerts ?? []))
      .finally(() => setFetching(false));
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!keywords.trim() && !location.trim()) {
      setError('Enter keywords or a location.'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/candidate/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywords.trim(), location: location.trim() }),
      });
      const data = await res.json() as { alert?: Alert; error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to save alert.'); return; }
      setAlerts(prev => [data.alert!, ...prev]);
      setKeywords(''); setLocation('');
      addToast({ title: 'Alert created!', message: 'You\'ll see matching jobs on your dashboard', variant: 'success' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/candidate/alerts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
        addToast({ title: 'Alert deleted', variant: 'success' });
      } else {
        addToast({ title: 'Failed to delete alert', variant: 'error' });
      }
    } finally {
      setDeleting(null);
    }
  };

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser(); router.push('/');
  };

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Job Alerts</h1>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {alerts.length}/5
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-5">

            {/* Add alert form */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Create a Job Alert</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                We&apos;ll highlight matching jobs on your dashboard. Max 5 alerts.
              </p>

              {error && (
                <div className="mt-3 rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">{error}</div>
              )}

              <form onSubmit={handleAdd} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Keywords <span className="text-muted-foreground">(job title, skill, company)</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="e.g. React Developer, Product Manager"
                      className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Location <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, Remote"
                      className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving || alerts.length >= 5}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Create Alert'}
                </button>
                {alerts.length >= 5 && (
                  <p className="text-xs text-muted-foreground">Delete an existing alert to add a new one.</p>
                )}
              </form>
            </div>

            {/* Alert list */}
            <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-sm font-semibold text-foreground">Active Alerts</h2>
              </div>

              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm font-medium text-foreground">No alerts yet</p>
                  <p className="text-xs text-muted-foreground">Create your first alert above</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {alerts.map(alert => (
                    <li key={alert.id} className="flex items-start justify-between gap-4 px-6 py-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {alert.keywords && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              <Search className="h-3 w-3" />{alert.keywords}
                            </span>
                          )}
                          {alert.location && (
                            <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              <MapPin className="h-3 w-3" />{alert.location}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Created {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deleting === alert.id}
                        className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                        aria-label="Delete alert"
                      >
                        {deleting === alert.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />
                        }
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
