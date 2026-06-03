'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Edit2, X, Plus, Loader2, ChevronLeft } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string | null;
  candidate: { id: string; name: string; email: string };
}

interface JobDetail {
  id: string;
  title: string;
  location: string;
  type: string;
  experienceLevel: string;
  description: string;
  skills: string[];
  vacancies: number;
  status: string;
  salaryMin: number | null;
  salaryMax: number | null;
  _count: { applications: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  APPLIED:             'Applied',
  REVIEWING:           'Reviewing',
  SHORTLISTED:         'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  HIRED:               'Hired',
  REJECTED:            'Rejected',
};

const STATUS_CLS: Record<string, string> = {
  APPLIED:             'bg-blue-100 text-blue-700',
  REVIEWING:           'bg-gray-100 text-gray-600',
  SHORTLISTED:         'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-yellow-100 text-yellow-700',
  HIRED:               'bg-green-100 text-green-700',
  REJECTED:            'bg-red-100 text-red-600',
};

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', REMOTE: 'Remote',
  CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [job,          setJob]          = useState<JobDetail | null>(null);
  const [apps,         setApps]         = useState<Application[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [notFound,     setNotFound]     = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal,    setShowModal]    = useState(false);
  const [schedulingFor,setSchedulingFor]= useState<string | null>(null);
  const [ivRound,      setIvRound]      = useState('');
  const [ivDate,       setIvDate]       = useState('');
  const [ivTime,       setIvTime]       = useState('');
  const [ivMode,       setIvMode]       = useState('Online');
  const [ivInterviewer,setIvInterviewer]= useState('');
  const [ivLink,       setIvLink]       = useState('');
  const [updatingApp,  setUpdatingApp]  = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;

    Promise.all([
      fetch(`/api/employer/jobs/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/employer/applications?jobId=${id}&limit=100`).then(r => r.ok ? r.json() : null),
    ])
      .then(([jobData, appData]: [JobDetail | null, { applications?: Application[] } | null]) => {
        if (!jobData) { setNotFound(true); return; }
        setJob(jobData);
        setApps(appData?.applications ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateAppStatus = async (appId: string, status: string) => {
    setUpdatingApp(appId);
    await fetch(`/api/employer/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    setUpdatingApp(null);
  };

  const scheduleInterview = async () => {
    if (!schedulingFor || !job) return;
    try {
      await fetch('/api/employer/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: schedulingFor,
          jobId:         job.id,
          round:         ivRound,
          date:          ivDate,
          time:          ivTime,
          mode:          ivMode,
          interviewer:   ivInterviewer,
          link:          ivLink,
        }),
      });
    } catch { /* non-fatal */ }
    setShowModal(false);
    setSchedulingFor(null);
    setIvRound(''); setIvDate(''); setIvTime(''); setIvInterviewer(''); setIvLink('');
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#6B46C1] focus:outline-none';

  if (loading) return (
    <EmployerShell>
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#6B46C1]" />
      </div>
    </EmployerShell>
  );

  if (notFound || !job) return (
    <EmployerShell>
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
        <p className="text-sm font-medium text-gray-600">Job not found or you don&apos;t have access.</p>
        <button onClick={() => router.push('/employer/jobs')}
          className="flex items-center gap-1.5 text-sm text-[#6B46C1] hover:underline">
          <ChevronLeft className="h-4 w-4" /> Back to My Listings
        </button>
      </div>
    </EmployerShell>
  );

  const filtered = statusFilter === 'all'
    ? apps
    : apps.filter(a => a.status === statusFilter);

  return (
    <EmployerShell>
      {/* Interview schedule modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Schedule Interview</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Round</label>
                <select value={ivRound} onChange={e => setIvRound(e.target.value)} className={inputCls}>
                  <option value="">Select round…</option>
                  {['HR Round', 'Technical Round', 'Final Round', 'Culture Fit'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Date</label>
                  <input type="date" value={ivDate} onChange={e => setIvDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Time</label>
                  <input type="time" value={ivTime} onChange={e => setIvTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Mode</label>
                <select value={ivMode} onChange={e => setIvMode(e.target.value)} className={inputCls}>
                  {['Online', 'In-person', 'Phone'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Interviewer</label>
                <input value={ivInterviewer} onChange={e => setIvInterviewer(e.target.value)} placeholder="Interviewer name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Meeting Link</label>
                <input value={ivLink} onChange={e => setIvLink(e.target.value)} placeholder="meet.google.com/…" className={inputCls} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600">
                Cancel
              </button>
              <button onClick={scheduleInterview}
                className="flex-1 rounded-xl bg-[#6B46C1] py-2.5 text-sm font-bold text-white hover:bg-purple-700">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        {/* Job header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button onClick={() => router.push('/employer/jobs')}
              className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <ChevronLeft className="h-3.5 w-3.5" /> My Listings
            </button>
            <h1 className="text-2xl font-extrabold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {job.location} · {TYPE_LABELS[job.type] ?? job.type} · {EXP_LABELS[job.experienceLevel] ?? job.experienceLevel}
            </p>
          </div>
          <Link href={`/employer/jobs/${job.id}/edit`}
            className="flex items-center gap-2 rounded-xl bg-[#6B46C1] px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700">
            <Edit2 className="h-4 w-4" /> Edit
          </Link>
        </div>

        {job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map(s => (
              <span key={s} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{s}</span>
            ))}
          </div>
        )}
        {job.description && (
          <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{job.description}</p>
        )}

        {/* Applicants */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-gray-900">Applicants ({apps.length})</h2>
            <div className="flex flex-wrap gap-2">
              {(['all', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize transition-colors ${
                    statusFilter === f ? 'bg-[#6B46C1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {f === 'all' ? 'All' : (STATUS_LABELS[f] ?? f)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No applicants for this filter.</p>
            )}
            {filtered.map(app => (
              <div key={app.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900">{app.candidate.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CLS[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{app.candidate.email}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {app.coverLetter && (
                      <p className="mt-1 max-w-md text-xs text-gray-500 line-clamp-2">{app.coverLetter}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={app.status}
                      disabled={updatingApp === app.id}
                      onChange={e => updateAppStatus(app.id, e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none disabled:opacity-50"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <Link href={`/employer/candidates/${app.candidate.id}`}
                      className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
                      View Profile
                    </Link>
                    <button
                      onClick={() => { setSchedulingFor(app.id); setShowModal(true); }}
                      className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                      <Plus className="h-3 w-3" /> Interview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EmployerShell>
  );
}
