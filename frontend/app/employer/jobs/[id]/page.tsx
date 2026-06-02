'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Edit2, X, Plus } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';
import { type CandidateStatus } from '@/data/employerData';

const STATUS_LABELS: Record<CandidateStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  hired: 'Hired',
  rejected: 'Rejected',
};

const STATUS_CLS: Record<CandidateStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-gray-100 text-gray-600',
  shortlisted: 'bg-purple-100 text-purple-700',
  interview_scheduled: 'bg-yellow-100 text-yellow-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const { jobs, candidates, updateCandidate, addInterview } = useEmployerStore();

  const job = jobs.find((j) => j.id === params.id);

  const [statusFilter,  setStatusFilter]  = useState<CandidateStatus | 'all'>('all');
  const [showModal,     setShowModal]     = useState(false);
  const [schedulingFor, setSchedulingFor] = useState<string | null>(null);
  const [ivRound,       setIvRound]       = useState('');
  const [ivDate,        setIvDate]        = useState('');
  const [ivTime,        setIvTime]        = useState('');
  const [ivMode,        setIvMode]        = useState('Online');
  const [ivInterviewer, setIvInterviewer] = useState('');
  const [ivLink,        setIvLink]        = useState('');

  if (!job) return notFound();

  const applicants = candidates.filter((c) => c.jobId === job.id);

  const filtered = applicants.filter(
    (c) => statusFilter === 'all' || c.status === statusFilter
  );

  const scheduleInterview = () => {
    if (!schedulingFor) return;
    addInterview({
      id: `i${Date.now()}`,
      candidateId: schedulingFor,
      jobId: job.id,
      round: ivRound,
      date: ivDate,
      time: ivTime,
      mode: ivMode,
      link: ivLink,
      interviewer: ivInterviewer,
      status: 'scheduled',
    });
    updateCandidate(schedulingFor, { status: 'interview_scheduled', stage: ivRound });
    setShowModal(false);
    setSchedulingFor(null);
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#6B46C1] focus:outline-none';

  return (
    <EmployerShell>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Schedule Interview</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Round</label>
                <select value={ivRound} onChange={(e) => setIvRound(e.target.value)} className={inputCls}>
                  <option value="">Select round...</option>
                  {['HR Round', 'Technical Round', 'Final Round', 'Culture Fit'].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Date</label>
                  <input type="date" value={ivDate} onChange={(e) => setIvDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Time</label>
                  <input type="time" value={ivTime} onChange={(e) => setIvTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Mode</label>
                <select value={ivMode} onChange={(e) => setIvMode(e.target.value)} className={inputCls}>
                  {['Online', 'In-person', 'Phone'].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Interviewer</label>
                <input value={ivInterviewer} onChange={(e) => setIvInterviewer(e.target.value)} placeholder="Interviewer name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Meeting Link</label>
                <input value={ivLink} onChange={(e) => setIvLink(e.target.value)} placeholder="meet.google.com/…" className={inputCls} />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={scheduleInterview} className="flex-1 rounded-xl bg-[#6B46C1] py-2.5 text-sm font-bold text-white hover:bg-purple-700">Schedule</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        {/* Job header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{job.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{job.location} · {job.type} · {job.experience}</p>
          </div>
          <Link href={`/employer/jobs/${job.id}/edit`}
            className="flex items-center gap-2 rounded-xl bg-[#6B46C1] px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700">
            <Edit2 className="h-4 w-4" /> Edit
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.map((s) => (
            <span key={s} className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{s}</span>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-700">{job.description}</p>

        {/* Applicants */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-gray-900">Applicants ({applicants.length})</h2>
            <div className="flex flex-wrap gap-2">
              {(['all', 'new', 'reviewed', 'shortlisted', 'interview_scheduled'] as const).map((f) => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold capitalize transition-colors ${statusFilter === f ? 'bg-[#6B46C1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'all' ? 'All' : STATUS_LABELS[f as CandidateStatus]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">No applicants for this filter.</p>
            )}
            {filtered.map((c) => (
              <div key={c.id} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_CLS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.experience} · Applied {c.appliedDate}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.skills.map((s) => (
                        <span key={s} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">{s}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-purple-600 font-medium">Stage: {c.stage}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => updateCandidate(c.id, { status: e.target.value as CandidateStatus })}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-600 focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <Link href={`/employer/candidates/${c.id}`}
                      className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
                      View Profile
                    </Link>
                    <button
                      onClick={() => { setSchedulingFor(c.id); setShowModal(true); }}
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
