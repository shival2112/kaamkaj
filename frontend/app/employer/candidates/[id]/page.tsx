'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, ChevronRight, CalendarPlus } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { ScheduleInterviewModal } from '@/components/employer/ScheduleInterviewModal';
import { useEmployerStore } from '@/store/employerStore';
import { PIPELINE_STAGES, type Interview } from '@/data/employerData';

export default function CandidateProfilePage() {
  const params = useParams<{ id: string }>();
  const { candidates, jobs, interviews, updateCandidate, addInterview } = useEmployerStore();

  const candidate = candidates.find((c) => c.id === params.id);

  const [notes, setNotes]               = useState(candidate?.notes ?? '');
  const [notesSaved, setNotesSaved]     = useState(false);
  const [showResume, setShowResume]     = useState(false);
  const [rejected, setRejected]         = useState(candidate?.status === 'rejected');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (!candidate) return notFound();

  const job        = jobs.find((j) => j.id === candidate.jobId);
  const cInterviews = interviews.filter((i) => i.candidateId === candidate.id);

  const handleScheduleSave = (data: Omit<Interview, 'id' | 'status' | 'questions' | 'feedback'>) => {
    addInterview({ ...data, id: `i${Date.now()}`, status: 'scheduled' });
  };

  const currentStageIdx = PIPELINE_STAGES.indexOf(candidate.stage as typeof PIPELINE_STAGES[number]);

  const moveNext = () => {
    const nextIdx = currentStageIdx + 1;
    if (nextIdx >= PIPELINE_STAGES.length) return;
    const nextStage = PIPELINE_STAGES[nextIdx];
    updateCandidate(candidate.id, {
      stage: nextStage,
      status: nextStage === 'Offer' ? 'hired' : 'shortlisted',
    });
  };

  const reject = () => {
    updateCandidate(candidate.id, { status: 'rejected' });
    setRejected(true);
  };

  const saveNotes = () => {
    updateCandidate(candidate.id, { notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <EmployerShell>
      {showResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-bold text-gray-900">Resume Preview</p>
            <p className="mt-1 text-sm text-gray-500">Resume preview not available in demo.</p>
            <button onClick={() => setShowResume(false)}
              className="mt-5 rounded-xl bg-[#6B46C1] px-8 py-2.5 text-sm font-bold text-white">OK</button>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        <Link href={job ? `/employer/jobs/${job.id}` : '/employer/jobs'}
          className="mb-4 inline-flex items-center gap-1 text-sm text-[#6B46C1] hover:underline">
          ← Back to {job?.title ?? 'Listings'}
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
                  <p className="text-sm text-gray-500">{candidate.experience} experience</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {candidate.skills.map((s) => (
                  <span key={s} className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">{s}</span>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>Applied: {candidate.appliedDate}</p>
                {job && <p>Role: {job.title}</p>}
                <p>Stage: <span className="font-semibold text-purple-700">{candidate.stage}</span></p>
              </div>

              <button onClick={() => setShowResume(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <FileText className="h-4 w-4" /> View Resume
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
              <button onClick={saveNotes}
                className={`mt-2 w-full rounded-xl py-2 text-xs font-bold transition-colors ${notesSaved ? 'bg-green-500 text-white' : 'bg-[#6B46C1] text-white hover:bg-purple-700'}`}>
                {notesSaved ? '✓ Saved' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Right: Pipeline */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-bold text-gray-900">Hiring Pipeline</h2>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone     = idx < currentStageIdx;
                  const isCurrent  = idx === currentStageIdx;
                  const isFuture   = idx > currentStageIdx;
                  return (
                    <div key={stage} className={`flex items-center gap-4 rounded-xl p-3 ${isCurrent ? 'bg-purple-50 ring-1 ring-purple-200' : ''}`}>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#6B46C1] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`text-sm font-medium ${isCurrent ? 'text-purple-900 font-bold' : isFuture ? 'text-gray-400' : 'text-gray-700'}`}>
                        {stage}
                      </span>
                      {isCurrent && <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-purple-500">Current</span>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={moveNext}
                  disabled={currentStageIdx >= PIPELINE_STAGES.length - 1 || rejected}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40">
                  Move to Next Stage <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={reject} disabled={rejected}
                  className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed ${rejected ? 'bg-red-100 text-red-400' : 'border border-red-200 text-red-500 hover:bg-red-50'}`}>
                  {rejected ? 'Rejected' : 'Reject'}
                </button>
              </div>
            </div>

            {/* Interview history */}
            {cInterviews.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-bold text-gray-900">Interview History</h2>
                <div className="space-y-3">
                  {cInterviews.map((iv) => (
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
        candidates={candidates}
        jobs={jobs}
        prefillCandidateId={candidate.id}
      />
    </EmployerShell>
  );
}
