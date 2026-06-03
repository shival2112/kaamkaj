'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Pause, Play, Eye, Copy, Trash2, Zap } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';
import { type Job, type JobStatus } from '@/data/employerData';

const STATUS_STYLES: Record<JobStatus, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-gray-100 text-gray-500',
};

function dbStatusToLocal(s: string): JobStatus {
  if (s === 'ACTIVE') return 'active';
  if (s === 'DRAFT')  return 'paused';
  return 'closed';
}

// DB API returns enum strings → normalise to display-friendly strings
const EXP_DISPLAY: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};
const TYPE_DISPLAY: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
};

interface DbApiJob {
  id: string; title: string; location: string; type: string; status: string;
  skills: string[]; vacancies: number; experienceLevel: string;
  description: string; createdAt: string; viewCount?: number;
  totalApplicants?: number;
  applicantsThisWeek?: number;
}

interface JobPerf { total: number; thisWeek: number; views: number }

function dbJobToLocal(j: DbApiJob): Job {
  return {
    id:          j.id,
    title:       j.title,
    location:    j.location,
    type:        TYPE_DISPLAY[j.type]          ?? j.type,
    experience:  EXP_DISPLAY[j.experienceLevel] ?? j.experienceLevel,
    skills:      j.skills,
    openings:    j.vacancies,
    deadline:    '',
    urgent:      false,
    status:      dbStatusToLocal(j.status),
    description: j.description,
    postedDate:  j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : '',
    views:       0,
  };
}

export default function MyListingsPage() {
  const router = useRouter();
  const { jobs: localJobs, candidates, updateJob, deleteJob, addJob } = useEmployerStore();
  const [filter, setFilter] = useState<'all' | JobStatus>('all');

  // ── DB-fetched jobs stored in local React state ──────────────────────────────
  // This is the fix for NextAuth employers: AppAuthContext.activeId is null for
  // them, so addJob() is a no-op. We bypass that by storing DB results here
  // and merging them with localJobs for rendering.
  const [dbJobs,      setDbJobs]      = useState<Job[]>([]);
  const [dbJobIds,    setDbJobIds]    = useState<Set<string>>(new Set());
  const [perfMap,     setPerfMap]     = useState<Map<string, JobPerf>>(new Map());
  const [fetching,    setFetching]    = useState(true);
  const [duplicating, setDuplicating] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/employer/jobs')
      .then(r => r.ok ? r.json() : null)
      .then((data: { jobs?: DbApiJob[] } | null) => {
        if (!data?.jobs) { setFetching(false); return; }

        const normalised = data.jobs.map(dbJobToLocal);
        setDbJobs(normalised);
        setDbJobIds(new Set(data.jobs.map(j => j.id)));

        // Build performance map from API-supplied counts
        const pm = new Map<string, JobPerf>();
        data.jobs.forEach(j => {
          pm.set(j.id, { total: j.totalApplicants ?? 0, thisWeek: j.applicantsThisWeek ?? 0, views: j.viewCount ?? 0 });
        });
        setPerfMap(pm);

        // Also try addJob() for AppAuthContext/demo employers who DO have an activeId.
        // For NextAuth employers this is a no-op (mutateEmployer returns early when
        // activeId is null) — that's fine because dbJobs already has the data.
        normalised.forEach(j => {
          if (!localJobs.find(lj => lj.id === j.id)) addJob(j);
        });

        console.log('[employer/jobs] loaded', data.jobs.length, 'jobs from DB');
      })
      .catch(err => console.warn('[employer/jobs] DB fetch non-fatal:', err))
      .finally(() => setFetching(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge: DB jobs first (source of truth), then any localStorage-only jobs
  // that aren't already represented in the DB set.
  const mergedJobs: Job[] = [
    ...dbJobs,
    ...localJobs.filter(lj => !dbJobIds.has(lj.id)),
  ];

  const filtered = mergedJobs.filter((j) => filter === 'all' || j.status === filter);

  const applicantCount = (jobId: string) =>
    candidates.filter((c) => c.jobId === jobId).length;

  const duplicate = async (jobId: string) => {
    const job = mergedJobs.find((j) => j.id === jobId);
    if (!job || duplicating.has(jobId)) return;

    // Local-only (demo/phone-OTP) jobs — fall back to Zustand store
    if (!dbJobIds.has(jobId)) {
      addJob({
        ...job,
        id: `j${Date.now()}`,
        title: `${job.title} (Copy)`,
        status: 'paused',
        views: 0,
        postedDate: new Date().toISOString().slice(0, 10),
      });
      return;
    }

    // DB job — fetch full data then POST a real copy
    setDuplicating(prev => new Set(prev).add(jobId));
    try {
      // Fetch the full job (gets DB enums + salary, not just display values)
      const getRes = await fetch(`/api/employer/jobs/${jobId}`);
      if (!getRes.ok) throw new Error('Could not fetch job');
      const original = await getRes.json() as DbApiJob & {
        type: string; experienceLevel: string;
        salaryMin?: number | null; salaryMax?: number | null;
      };

      const postRes = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:           `${original.title} (Copy)`,
          description:     original.description,
          location:        original.location,
          type:            original.type,
          experienceLevel: original.experienceLevel,
          vacancies:       original.vacancies,
          skills:          original.skills,
          salaryMin:       original.salaryMin ?? undefined,
          salaryMax:       original.salaryMax ?? undefined,
        }),
      });

      if (!postRes.ok) {
        const err = await postRes.json() as { error?: string };
        console.error('[duplicate] POST failed:', err.error);
        return;
      }

      const created = await postRes.json() as DbApiJob;
      const localCopy = dbJobToLocal({ ...created, totalApplicants: 0, applicantsThisWeek: 0, viewCount: 0 });

      // Optimistically insert at top of list
      setDbJobs(prev => [localCopy, ...prev]);
      setDbJobIds(prev => { const s = new Set(prev); s.add(created.id); return s; });
      setPerfMap(prev => new Map(prev).set(created.id, { total: 0, thisWeek: 0, views: 0 }));
      console.log('[duplicate] created copy', created.id, 'from', jobId);
    } catch (err) {
      console.error('[duplicate] error:', err);
    } finally {
      setDuplicating(prev => { const s = new Set(prev); s.delete(jobId); return s; });
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: JobStatus) => {
    const next: JobStatus = currentStatus === 'active' ? 'paused' : 'active';

    // Update local display immediately
    setDbJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: next } : j));
    updateJob(jobId, { status: next });

    if (dbJobIds.has(jobId)) {
      const dbStatus = next === 'active' ? 'ACTIVE' : 'DRAFT';
      const res = await fetch(`/api/employer/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        console.warn('[employer/jobs] status update failed:', err.error);
      } else {
        console.log('[employer/jobs] status updated in DB:', jobId, '→', dbStatus);
      }
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this job?')) return;

    // Remove from local display immediately
    setDbJobs(prev => prev.filter(j => j.id !== jobId));
    deleteJob(jobId);

    if (dbJobIds.has(jobId)) {
      const res = await fetch(`/api/employer/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        console.warn('[employer/jobs] DB delete failed:', err.error);
      } else {
        console.log('[employer/jobs] deleted from DB:', jobId);
        setDbJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
      }
    }
  };

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
          <Link
            href="/employer/jobs/new"
            className="rounded-xl bg-[#6B46C1] px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
          >
            + Post a Job
          </Link>
        </div>

        {/* Filter pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-[#6B46C1] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Job cards */}
        <div className="mt-5 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No listings found.</p>
          ) : filtered.map((job) => (
            <div key={job.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className="cursor-pointer font-bold text-gray-900 hover:text-[#6B46C1]"
                      onClick={() => router.push(`/employer/jobs/${job.id}`)}
                    >
                      {job.title}
                    </h2>
                    {job.urgent && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                        <Zap className="h-3 w-3" /> Urgent
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.type}</span>
                    <span>·</span>
                    <span>{job.experience}</span>
                    <span>·</span>
                    <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span key={s} className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                    <span>Posted {job.postedDate}</span>
                    <span>👤 {perfMap.get(job.id)?.total ?? applicantCount(job.id)} applicants</span>
                    {(perfMap.get(job.id)?.thisWeek ?? 0) > 0 && (
                      <span className="font-semibold text-green-600">
                        +{perfMap.get(job.id)!.thisWeek} this week
                      </span>
                    )}
                    {(perfMap.get(job.id)?.views ?? 0) > 0 && (
                      <span>👁 {perfMap.get(job.id)!.views} views</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Link href={`/employer/jobs/${job.id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(job.id, job.status)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300"
                  >
                    {job.status === 'active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {job.status === 'active' ? 'Pause' : 'Unpause'}
                  </button>
                  <Link href={`/employer/applications?jobId=${job.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
                    <Eye className="h-3.5 w-3.5" /> Applicants ({perfMap.get(job.id)?.total ?? applicantCount(job.id)})
                  </Link>
                  <button
                    onClick={() => duplicate(job.id)}
                    disabled={duplicating.has(job.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300 disabled:opacity-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {duplicating.has(job.id) ? 'Duplicating…' : 'Duplicate'}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployerShell>
  );
}
