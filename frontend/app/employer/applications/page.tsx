'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Download, X, FileText, ExternalLink, StickyNote, Check } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  employerNotes?: string | null;
  job:       { id: string; title: string; status: string };
  candidate: { id: string; name: string; email: string };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWING:   'bg-sky-100 text-sky-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-600',
};

const NEXT_STATUSES: Record<string, { label: string; value: string; style: string }[]> = {
  APPLIED:     [{ label: 'Review',    value: 'REVIEWING',   style: 'text-sky-700 hover:bg-sky-50' },
                { label: 'Shortlist', value: 'SHORTLISTED', style: 'text-yellow-700 hover:bg-yellow-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  REVIEWING:   [{ label: 'Shortlist', value: 'SHORTLISTED', style: 'text-yellow-700 hover:bg-yellow-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  SHORTLISTED: [{ label: 'Hire',      value: 'HIRED',       style: 'text-emerald-700 hover:bg-emerald-50' },
                { label: 'Reject',    value: 'REJECTED',    style: 'text-red-600 hover:bg-red-50' }],
  REJECTED: [], HIRED: [],
};

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// ─── Candidate drawer ─────────────────────────────────────────────────────────

interface CandidateProfile {
  id: string; name: string; email: string; phone: string | null;
  avatar: string | null; resumeUrl: string | null;
  headline: string | null; bio: string | null;
  location: string | null; experienceLevel: string | null;
  skills: string[];
  applications: { id: string; status: string; appliedAt: string; job: { id: string; title: string } }[];
}

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

const APP_STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700', REVIEWING: 'bg-sky-100 text-sky-700',
  SHORTLISTED: 'bg-yellow-100 text-yellow-700', HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};

function CandidateDrawer({ candidateId, onClose }: { candidateId: string; onClose: () => void }) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/employer/candidates/${candidateId}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: CandidateProfile | null) => setProfile(d))
      .catch(err => console.error('[candidate-drawer]', err))
      .finally(() => setLoading(false));
  }, [candidateId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">Candidate Profile</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
            </div>
          ) : !profile ? (
            <p className="text-sm text-gray-500">Could not load profile.</p>
          ) : (
            <div className="space-y-5">
              {/* Identity */}
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${tileColor(profile.name)}`}>
                  {profile.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">{profile.name}</p>
                  {profile.headline && (
                    <p className="text-sm font-medium text-primary">{profile.headline}</p>
                  )}
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  {profile.phone && <p className="text-xs text-gray-400">{profile.phone}</p>}
                </div>
              </div>

              {/* Location + Experience */}
              {(profile.location || profile.experienceLevel) && (
                <div className="flex flex-wrap gap-3">
                  {profile.location && (
                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      📍 {profile.location}
                    </span>
                  )}
                  {profile.experienceLevel && (
                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      💼 {EXP_LABELS[profile.experienceLevel] ?? profile.experienceLevel}
                    </span>
                  )}
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">About</p>
                  <p className="text-sm leading-relaxed text-gray-600">{profile.bio}</p>
                </div>
              )}

              {/* Resume */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Resume</p>
                {profile.resumeUrl ? (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#6B46C1] hover:bg-purple-50 transition-colors">
                    <FileText className="h-4 w-4" />
                    View Resume
                    <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-50" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No resume uploaded</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Skills</p>
                {profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(skill => (
                      <span key={skill} className="rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No skills listed</p>
                )}
              </div>

              {/* Applications to this employer */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Applications to your jobs
                </p>
                {profile.applications.length === 0 ? (
                  <p className="text-sm text-gray-400">No applications found</p>
                ) : (
                  <div className="space-y-2">
                    {profile.applications.map(app => (
                      <div key={app.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{app.job.title}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${APP_STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Stage action dropdown ────────────────────────────────────────────────────

function StageActions({ app, onUpdated }: { app: Application; onUpdated: (id: string, status: string) => void }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const nexts = NEXT_STATUSES[app.status] ?? [];
  if (nexts.length === 0) return <span className="text-xs text-gray-400">—</span>;

  const update = async (status: string) => {
    setLoading(true); setOpen(false);
    const res = await fetch(`/api/employer/applications/${app.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onUpdated(app.id, status);
    setLoading(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} disabled={loading}
        className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#6B46C1] hover:text-[#6B46C1] disabled:opacity-50">
        {loading ? '…' : 'Update'} <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {nexts.map(n => (
            <button key={n.value} onClick={() => update(n.value)}
              className={cn('block w-full px-4 py-2 text-left text-xs font-medium transition-colors', n.style)}>
              {n.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notes editor ────────────────────────────────────────────────────────────

function NotesEditor({ appId, initialNotes }: { appId: string; initialNotes?: string | null }) {
  const [open,   setOpen]   = useState(false);
  const [text,   setText]   = useState(initialNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/employer/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: text }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Private notes"
        className={cn(
          'flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
          text
            ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
        )}
      >
        <StickyNote className="h-3.5 w-3.5" />
        {text ? 'Note ✎' : 'Note'}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Private note (only you can see this)</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder="Add your notes here…"
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:border-[#6B46C1] focus:outline-none focus:ring-1 focus:ring-[#6B46C1]"
          />
          <div className="mt-2 flex items-center justify-between">
            <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-[#6B46C1] px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {saved ? <><Check className="h-3 w-3" /> Saved</> : saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CSV export ──────────────────────────────────────────────────────────────

function exportToCSV(apps: Application[], filename: string) {
  const HEADERS = ['Candidate Name', 'Email', 'Job Title', 'Stage', 'Applied Date'];

  const escape = (val: string) =>
    `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = apps.map(a => [
    escape(a.candidate.name),
    escape(a.candidate.email),
    escape(a.job.title),
    escape(a.status.charAt(0) + a.status.slice(1).toLowerCase()),
    escape(new Date(a.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })),
  ].join(','));

  const csv = [HEADERS.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Page content ─────────────────────────────────────────────────────────────

function ApplicationsContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const jobId        = searchParams.get('jobId') ?? '';

  const [apps,              setApps]             = useState<Application[]>([]);
  const [total,             setTotal]            = useState(0);
  const [loading,           setLoading]          = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  // jobId → current DB status (shared across all rows for the same job)
  const [jobStatuses,       setJobStatuses]      = useState<Map<string, string>>(new Map());

  const fetchApps = useCallback(() => {
    setLoading(true);
    const url = `/api/employer/applications${jobId ? `?jobId=${encodeURIComponent(jobId)}` : ''}`;
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: { applications?: Application[]; total?: number }) => {
        const fetched = d.applications ?? [];
        setApps(fetched);
        setTotal(d.total ?? 0);
        // Build initial job-status map from the fetched data
        const map = new Map<string, string>();
        fetched.forEach(a => map.set(a.job.id, a.job.status));
        setJobStatuses(map);
      })
      .catch(err => console.error('[employer/applications]', err))
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleUpdated = (id: string, status: string) =>
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));

  const handleToggleJobStatus = async (jobId: string) => {
    const current = jobStatuses.get(jobId) ?? 'ACTIVE';
    const next    = current === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';

    // Optimistic update — affects every row that belongs to this job
    setJobStatuses(prev => new Map(prev).set(jobId, next));

    const res = await fetch(`/api/employer/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      // Roll back on failure
      setJobStatuses(prev => new Map(prev).set(jobId, current));
      console.error('[applications] job status toggle failed');
    }
  };

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Applications Received</h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-500">
                {total} application{total !== 1 ? 's' : ''}
                {jobId && (
                  <> for this job &mdash;{' '}
                    <button onClick={() => router.push('/employer/applications')}
                      className="text-[#6B46C1] hover:underline">
                      view all
                    </button>
                  </>
                )}
              </p>
            )}
          </div>

          {!loading && apps.length > 0 && (
            <button
              onClick={() => {
                const date     = new Date().toISOString().slice(0, 10);
                const filename = jobId
                  ? `applications-job-${jobId.slice(0, 8)}-${date}.csv`
                  : `applications-${date}.csv`;
                exportToCSV(apps, filename);
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-[#6B46C1] hover:text-[#6B46C1]"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
            {['Candidate', 'Job', 'Stage', 'Applied', 'Action'].map(col => (
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
              <p className="font-medium text-gray-700">No applications yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Applications will appear here once candidates apply to your jobs.
              </p>
            </div>
          ) : (
            apps.map(app => (
              <div key={app.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                {/* Candidate — click to open profile drawer */}
                <button
                  onClick={() => setSelectedCandidate(app.candidate.id)}
                  className="flex items-center gap-3 min-w-0 text-left group"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${tileColor(app.candidate.name)}`}>
                    {app.candidate.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-[#6B46C1] group-hover:underline">
                      {app.candidate.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">{app.candidate.email}</p>
                  </div>
                </button>

                {/* Job title + inline status toggle */}
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="truncate text-sm text-gray-600">{app.job.title}</p>
                  {(() => {
                    const s = jobStatuses.get(app.job.id) ?? app.job.status;
                    const isActive = s === 'ACTIVE';
                    return (
                      <button
                        onClick={() => handleToggleJobStatus(app.job.id)}
                        title={isActive ? 'Click to close job' : 'Click to reopen job'}
                        className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold transition-opacity hover:opacity-70 ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {isActive ? 'Active' : s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    );
                  })()}
                </div>

                {/* Status chip */}
                <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </span>

                {/* Applied date */}
                <p className="text-sm text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <StageActions app={app} onUpdated={handleUpdated} />
                  <NotesEditor appId={app.id} initialNotes={app.employerNotes} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Candidate profile drawer */}
      {selectedCandidate && (
        <CandidateDrawer
          candidateId={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </EmployerShell>
  );
}

export default function EmployerApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
