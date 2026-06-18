'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import { Plus, Loader2, X, Briefcase, Pencil, Trash2 } from 'lucide-react';

interface Job {
  id: string; title: string; location: string; description: string;
  type: string; status: string; experienceLevel: string;
  salaryMin: number | null; salaryMax: number | null;
  vacancies: number; skills: string[]; createdAt: string;
  _count: { applications: number };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:  'bg-green-100 text-green-700',
  CLOSED:  'bg-gray-100 text-gray-500',
  DRAFT:   'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-red-100 text-red-600',
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
  REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};

type FormState = {
  title: string; description: string; location: string;
  type: string; experienceLevel: string; status: string;
  salaryMin: string; salaryMax: string;
  skills: string; vacancies: string;
};

function toForm(job?: Job): FormState {
  return {
    title:           job?.title           ?? '',
    description:     job?.description     ?? '',
    location:        job?.location        ?? '',
    type:            job?.type            ?? 'FULL_TIME',
    experienceLevel: job?.experienceLevel ?? 'FRESHER',
    status:          job?.status          ?? 'ACTIVE',
    salaryMin:       job?.salaryMin?.toString() ?? '',
    salaryMax:       job?.salaryMax?.toString() ?? '',
    skills:          job?.skills?.join(', ') ?? '',
    vacancies:       job?.vacancies?.toString() ?? '1',
  };
}

function JobModal({
  mode, job, onClose, onSaved,
}: {
  mode: 'create' | 'edit';
  job?: Job;
  onClose: () => void;
  onSaved: (j: Job) => void;
}) {
  const [form,    setForm]    = useState<FormState>(toForm(job));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
      vacancies: form.vacancies ? parseInt(form.vacancies) : 1,
      skills:    form.skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      const url    = mode === 'edit' ? `/api/recruiter/jobs/${job!.id}` : '/api/recruiter/jobs';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as Job & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to save job'); return; }
      onSaved(data); onClose();
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-gray-900">
              {mode === 'create' ? 'Post a New Job' : 'Edit Job'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Job Title *</label>
              <input required value={form.title} onChange={set('title')} placeholder="e.g. Frontend Engineer" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Location *</label>
              <input required value={form.location} onChange={set('location')} placeholder="e.g. Bangalore" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Type</label>
              <select value={form.type} onChange={set('type')} className={inputCls}>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Experience Level</label>
              <select value={form.experienceLevel} onChange={set('experienceLevel')} className={inputCls}>
                {['FRESHER','JUNIOR','MID','SENIOR','LEAD'].map(v => (
                  <option key={v} value={v}>{v.charAt(0)+v.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {['ACTIVE','DRAFT','CLOSED'].map(v => (
                  <option key={v} value={v}>{v.charAt(0)+v.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Vacancies</label>
              <input type="number" min={1} value={form.vacancies} onChange={set('vacancies')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Min Salary (₹/mo)</label>
              <input type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Max Salary (₹/mo)</label>
              <input type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="Optional" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Skills (comma-separated)</label>
              <input value={form.skills} onChange={set('skills')} placeholder="React, TypeScript, Node.js" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Description *</label>
              <textarea required rows={5} value={form.description} onChange={set('description')}
                placeholder="Job responsibilities, requirements…" className={inputCls} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Post Job' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecruiterJobsInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [jobs,       setJobs]       = useState<Job[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modalMode,  setModalMode]  = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Job | undefined>();
  const [deleteMap,  setDeleteMap]  = useState<Record<string, boolean>>({});
  const [error,      setError]      = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/recruiter/jobs')
      .then(r => r.json())
      .then((d: { jobs?: Job[] }) => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModalMode('create'); router.replace('/recruiter/jobs');
    }
  }, [searchParams, router]);

  const openEdit = (job: Job) => { setEditTarget(job); setModalMode('edit'); };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleteMap(prev => ({ ...prev, [id]: true }));
    setError('');
    const res = await fetch(`/api/recruiter/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) setJobs(prev => prev.filter(j => j.id !== id));
    else {
      const d = await res.json() as { error?: string };
      setError(d.error ?? 'Failed to delete job');
    }
    setDeleteMap(prev => ({ ...prev, [id]: false }));
  };

  const handleSaved = (saved: Job) => {
    setJobs(prev => {
      const exists = prev.find(j => j.id === saved.id);
      if (exists) return prev.map(j => j.id === saved.id ? { ...saved, _count: j._count } : j);
      return [{ ...saved, _count: { applications: 0 } }, ...prev];
    });
  };

  return (
    <RecruiterShell>
      {modalMode && (
        <JobModal
          mode={modalMode}
          job={modalMode === 'edit' ? editTarget : undefined}
          onClose={() => { setModalMode(null); setEditTarget(undefined); }}
          onSaved={handleSaved}
        />
      )}

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
            <p className="mt-0.5 text-sm text-gray-500">Manage all job listings for your company.</p>
          </div>
          <button onClick={() => { setEditTarget(undefined); setModalMode('create'); }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Post a Job
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Briefcase className="h-10 w-10 text-gray-300" />
            <p className="mt-3 font-semibold text-gray-700">No jobs yet</p>
            <button onClick={() => setModalMode('create')}
              className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> Post your first job
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {['TITLE', 'TYPE', 'LEVEL', 'APPLICANTS', 'STATUS', 'ACTIONS'].map(h => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
              ))}
            </div>
            {jobs.map(job => (
              <div key={job.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-400">{job.location}</p>
                </div>
                <p className="text-sm text-gray-600">{TYPE_LABELS[job.type] ?? job.type}</p>
                <p className="text-sm text-gray-600">
                  {job.experienceLevel.charAt(0) + job.experienceLevel.slice(1).toLowerCase()}
                </p>
                <p className="text-sm font-semibold text-gray-900">{job._count.applications}</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(job)}
                    title="Edit job"
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-primary/40 hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    disabled={deleteMap[job.id]}
                    title="Delete job"
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                    {deleteMap[job.id]
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}

export default function RecruiterJobsPage() {
  return (
    <Suspense>
      <RecruiterJobsInner />
    </Suspense>
  );
}
