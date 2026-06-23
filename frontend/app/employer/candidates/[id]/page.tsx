'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, ChevronRight, CalendarPlus, Loader2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { ScheduleInterviewModal, type FormData as InterviewFormData } from '@/components/employer/ScheduleInterviewModal';

const STAGE_ORDER = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED'] as const;
const STAGE_LABELS: Record<string, string> = {
  APPLIED: 'Applied', REVIEWING: 'Screening', SHORTLISTED: 'Interview', HIRED: 'Offer',
};

interface CandidateApplication {
  id: string;
  status: string;
  appliedAt: string;
  employerNotes: string | null;
  job: { id: string; title: string };
}

interface CandidateInterview {
  id: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  status: string;
  link: string | null;
  job: { id: string; title: string } | null;
}

interface CandidateDetail {
  id: string;
  name: string;
  skills: string[];
  experienceLevel: string | null;
  applications: CandidateApplication[];
  interviews: CandidateInterview[];
}

const EXP_LABELS: Record<string, string> = {
  FRESHER: 'Fresher', JUNIOR: '1–3 yrs', MID: '3–6 yrs', SENIOR: '6–10 yrs', LEAD: '10+ yrs',
};

export default function CandidateProfilePage() {
  const params = useParams<{ id: string }>();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  const [notes, setNotes]               = useState('');
  const [notesSaved, setNotesSaved]     = useState(false);
  const [savingNotes, setSavingNotes]   = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen]   = useState(false);

  const load = useCallback(() => {
    fetch(`/api/employer/candidates/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: CandidateDetail | null) => {
        if (!data) { setNotFound(true); return; }
        setCandidate(data);
        setNotes(data.applications[0]?.employerNotes ?? '');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <EmployerShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#6B46C1]" />
        </div>
      </EmployerShell>
    );
  }

  if (notFound || !candidate) {
    return (
      <EmployerShell>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm font-medium text-gray-600">Candidate not found or you don&apos;t have access.</p>
          <Link href="/employer/applications" className="text-sm text-[#6B46C1] hover:underline">
            Back to Applications
          </Link>
        </div>
      </EmployerShell>
    );
  }

  const primaryApp = candidate.applications[0];
  const currentStageIdx = primaryApp ? STAGE_ORDER.indexOf(primaryApp.status as typeof STAGE_ORDER[number]) : -1;
  const rejected = primaryApp?.status === 'REJECTED';

  const patchApplication = async (body: Record<string, unknown>) => {
    if (!primaryApp) return;
    const res = await fetch(`/api/employer/applications/${primaryApp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
  };

  const moveNext = async () => {
    if (currentStageIdx < 0 || currentStageIdx >= STAGE_ORDER.length - 1) return;
    setUpdatingStage(true);
    await patchApplication({ status: STAGE_ORDER[currentStageIdx + 1] });
    setUpdatingStage(false);
  };

  const reject = async () => {
    setUpdatingStage(true);
    await patchApplication({ status: 'REJECTED' });
    setUpdatingStage(false);
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await patchApplication({ notes });
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  const viewResume = async () => {
    setResumeLoading(true);
    try {
      const res = await fetch(`/api/employer/candidates/${candidate.id}/resume`);
      if (!res.ok) { window.alert('No resume uploaded for this candidate.'); return; }
      const data = await res.json() as { downloadUrl: string };
      window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleScheduleSave = async (data: InterviewFormData) => {
    const app = candidate.applications.find(a => a.job.id === data.jobId) ?? primaryApp;
    if (!app) return;
    await fetch('/api/employer/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.id,
        date: data.date, time: data.time, mode: data.mode,
        link: data.link, round: data.round, interviewer: data.interviewer,
      }),
    });
    load();
  };

  const modalCandidates = [{ id: candidate.id, name: candidate.name, jobId: primaryApp?.job.id ?? '' }];
  const modalJobs = Array.from(
    new Map(candidate.applications.map(a => [a.job.id, { id: a.job.id, title: a.job.title }])).values()
  );

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <Link href={primaryApp ? `/employer/jobs/${primaryApp.job.id}` : '/employer/applications'}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline">
          ← Back to {primaryApp?.job.title ?? 'Applications'}
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Profile */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-extrabold text-purple-700">
                  {candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h1 className="font-extrabold text-gray-900">{candidate.name}</h1>
                  <p className="text-sm text-gray-500">
                    {candidate.experienceLevel ? EXP_LABELS[candidate.experienceLevel] ?? candidate.experienceLevel : 'Experience not set'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {candidate.skills.map((s) => (
                  <span key={s} className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">{s}</span>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                {primaryApp && <p>Applied: {new Date(primaryApp.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                {primaryApp && <p>Role: {primaryApp.job.title}</p>}
                {primaryApp && (
                  <p>Stage: <span className="font-semibold text-purple-700">{rejected ? 'Rejected' : STAGE_LABELS[primaryApp.status] ?? primaryApp.status}</span></p>
                )}
              </div>

              <button onClick={viewResume} disabled={resumeLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60">
                {resumeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} View Resume
              </button>
              <button onClick={() => setScheduleOpen(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B46C1] py-2.5 text-sm font-bold text-white hover:bg-purple-700">
                <CalendarPlus className="h-4 w-4" /> Schedule Interview
              </button>
            </div>

            {/* Notes */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-gray-900">Internal Notes</p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                placeholder="Add private notes about this candidate…"
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-[#6B46C1] focus:outline-none" />
              <button onClick={saveNotes} disabled={savingNotes}
                className={`mt-2 w-full rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-60 ${notesSaved ? 'bg-green-500 text-white' : 'bg-[#6B46C1] text-white hover:bg-purple-700'}`}>
                {notesSaved ? '✓ Saved' : savingNotes ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Right: Pipeline */}
          <div className="space-y-4 lg:col-span-2">
            {primaryApp && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-gray-900">Hiring Pipeline</h2>
                <div className="space-y-2">
                  {STAGE_ORDER.map((stage, idx) => {
                    const isDone     = idx < currentStageIdx;
                    const isCurrent  = idx === currentStageIdx;
                    const isFuture   = idx > currentStageIdx;
                    return (
                      <div key={stage} className={`flex items-center gap-4 rounded-xl p-3 ${isCurrent ? 'bg-purple-50 ring-1 ring-purple-200' : ''}`}>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#6B46C1] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-purple-900 font-bold' : isFuture ? 'text-gray-400' : 'text-gray-700'}`}>
                          {STAGE_LABELS[stage]}
                        </span>
                        {isCurrent && <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-purple-500">Current</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={moveNext} disabled={updatingStage || currentStageIdx >= STAGE_ORDER.length - 1 || rejected}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">
                    Move to Next Stage <ChevronRight className="h-4 w-4" />
                  </button>
                  <button onClick={reject} disabled={updatingStage || rejected}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed ${rejected ? 'bg-red-100 text-red-400' : 'border border-red-200 text-red-500 hover:bg-red-50'}`}>
                    {rejected ? 'Rejected' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {/* Interview history */}
            {candidate.interviews.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-bold text-gray-900">Interview History</h2>
                <div className="space-y-3">
                  {candidate.interviews.map((iv) => (
                    <div key={iv.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{iv.round}</p>
                        <p className="text-xs text-gray-500">{iv.date} · {iv.time} · {iv.mode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${iv.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : iv.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {iv.status}
                        </span>
                        {iv.status === 'scheduled' && (
                          <Link href={`/employer/interviews/${iv.id}`}
                            className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
                            Start
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScheduleInterviewModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSave={handleScheduleSave}
        candidates={modalCandidates}
        jobs={modalJobs}
        prefillCandidateId={candidate.id}
      />
    </EmployerShell>
  );
}
