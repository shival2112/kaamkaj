'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EmployerShell } from '@/components/employer/EmployerShell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  rating?: number | null;
  job:       { id: string; title: string };
  candidate: { id: string; name: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  HIRED:       'bg-green-100 text-green-700',
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ appId, initialRating }: { appId: string; initialRating?: number | null }) {
  const [rating,  setRating]  = useState(initialRating ?? 0);
  const [hover,   setHover]   = useState(0);
  const [saving,  setSaving]  = useState(false);

  const save = async (value: number) => {
    const next = value === rating ? 0 : value; // click same star → clear
    setSaving(true);
    setRating(next);
    await fetch(`/api/employer/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: next || null }),
    }).catch(() => {});
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-0.5" title={saving ? 'Saving…' : `Rating: ${rating}/5`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => save(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          disabled={saving}
          className="text-lg leading-none transition-transform hover:scale-110 disabled:opacity-50"
        >
          <span className={(hover || rating) >= star ? 'text-amber-400' : 'text-gray-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function HireRejectActions({ app, onUpdated }: {
  app: Application;
  onUpdated: (id: string, status: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const update = async (status: string) => {
    setLoading(true);
    const res = await fetch(`/api/employer/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onUpdated(app.id, status);
    setLoading(false);
  };

  if (app.status === 'HIRED') {
    return <span className="text-xs font-semibold text-green-600">Hired ✓</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => update('HIRED')}
        disabled={loading}
        className="rounded-md bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
      >
        Hire
      </button>
      <button
        onClick={() => update('REJECTED')}
        disabled={loading}
        className="rounded-md bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShortlistedPage() {
  const router = useRouter();
  const [apps,    setApps]    = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch SHORTLISTED + HIRED candidates
  const fetchShortlisted = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/employer/applications?status=SHORTLISTED&limit=100').then(r => r.ok ? r.json() : { applications: [] }),
      fetch('/api/employer/applications?status=HIRED&limit=100').then(r => r.ok ? r.json() : { applications: [] }),
    ])
      .then(([shortlisted, hired]) => {
        const all = [
          ...(shortlisted.applications ?? []),
          ...(hired.applications ?? []),
        ] as Application[];
        // Sort: SHORTLISTED first, then HIRED, both by appliedAt desc
        all.sort((a, b) => {
          if (a.status !== b.status) return a.status === 'SHORTLISTED' ? -1 : 1;
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        });
        setApps(all);
      })
      .catch(err => console.error('[shortlisted] fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchShortlisted(); }, [fetchShortlisted]);

  const handleUpdated = (id: string, status: string) => {
    if (status === 'REJECTED') {
      // Remove from list immediately when rejected
      setApps(prev => prev.filter(a => a.id !== id));
    } else {
      setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const shortlistedCount = apps.filter(a => a.status === 'SHORTLISTED').length;
  const hiredCount       = apps.filter(a => a.status === 'HIRED').length;

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Shortlisted Candidates</h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-500">
                {shortlistedCount} shortlisted · {hiredCount} hired
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/employer/applications')}
            className="text-sm text-[#6B46C1] hover:underline"
          >
            ← All applications
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {['Candidate', 'Job', 'Stage', 'Applied', 'Rating', 'Action'].map(col => (
              <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {col}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
            </div>
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-medium text-gray-700">No shortlisted candidates yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Shortlist candidates from the{' '}
                <button onClick={() => router.push('/employer/applications')}
                  className="text-[#6B46C1] hover:underline">
                  Applications page
                </button>
              </p>
            </div>
          ) : (
            apps.map(app => (
              <div key={app.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                {/* Candidate */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(app.candidate.name)}`}>
                    {app.candidate.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{app.candidate.name}</p>
                    <p className="truncate text-xs text-gray-400">{app.candidate.email}</p>
                  </div>
                </div>

                {/* Job */}
                <p className="truncate text-sm text-gray-600">{app.job.title}</p>

                {/* Status */}
                <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </span>

                {/* Date */}
                <p className="text-sm text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>

                {/* Rating */}
                <StarRating appId={app.id} initialRating={app.rating} />

                {/* Actions */}
                <HireRejectActions app={app} onUpdated={handleUpdated} />
              </div>
            ))
          )}
        </div>
      </div>
    </EmployerShell>
  );
}
