'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';

const RECOMMENDATIONS = [
  'Move to Next Round',
  'Final Select',
  'On Hold',
  'Reject',
] as const;

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-600">{label}</label>
        <span className="text-xs font-bold text-[#6B46C1]">{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#6B46C1]" />
      <div className="flex justify-between text-[10px] text-gray-400"><span>1</span><span>10</span></div>
    </div>
  );
}

export default function FeedbackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { interviews, candidates, updateCandidate, saveInterviewFeedback } = useEmployerStore();

  const interview = interviews.find((i) => i.id === params.id);

  const [overall,         setOverall]        = useState(7);
  const [technical,       setTechnical]      = useState(7);
  const [communication,   setCommunication]  = useState(7);
  const [culturalFit,     setCulturalFit]    = useState(7);
  const [problemSolving,  setProblemSolving] = useState(7);
  const [strengths,       setStrengths]      = useState('');
  const [improvements,    setImprovements]   = useState('');
  const [recommendation,  setRecommendation] = useState<string>(RECOMMENDATIONS[0]);
  const [saved, setSaved] = useState(false);

  if (!interview) return notFound();

  const outcomeMap: Record<string, string> = {
    'Move to Next Round': 'PASSED',
    'Final Select':       'PASSED',
    'On Hold':            'FAILED',
    'Reject':             'FAILED',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback = { overall, technical, communication, culturalFit, problemSolving, strengths, improvements, recommendation };
    saveInterviewFeedback(interview.id, feedback);

    const statusMap: Record<string, string> = {
      'Move to Next Round': 'shortlisted',
      'Final Select': 'hired',
      'On Hold': 'reviewed',
      'Reject': 'rejected',
    };
    updateCandidate(interview.candidateId, { status: (statusMap[recommendation] ?? 'reviewed') as import('@/data/employerData').CandidateStatus });

    // Persist to DB if this is a real meeting ID (fire-and-forget)
    fetch(`/api/employer/interviews/${params.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome: outcomeMap[recommendation] ?? 'PASSED',
        rating:  Math.max(1, Math.round(overall / 2)),
        notes:   [strengths && `Strengths: ${strengths}`, improvements && `Improvements: ${improvements}`].filter(Boolean).join('\n'),
      }),
    }).catch(() => {/* non-fatal — meeting may be mock-only */});

    setSaved(true);
    setTimeout(() => router.push(`/employer/candidates/${interview.candidateId}`), 1500);
  };

  const textareaCls = 'w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#6B46C1] focus:outline-none';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Post Interview Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          {interview.round} for candidate {candidates.find(c => c.id === interview.candidateId)?.name}
        </p>

        {saved && (
          <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ Feedback saved! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900">Ratings</h2>
            <RatingInput label="Overall Rating" value={overall} onChange={setOverall} />
            <RatingInput label="Technical Skills" value={technical} onChange={setTechnical} />
            <RatingInput label="Communication" value={communication} onChange={setCommunication} />
            <RatingInput label="Cultural Fit" value={culturalFit} onChange={setCulturalFit} />
            <RatingInput label="Problem Solving" value={problemSolving} onChange={setProblemSolving} />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Comments</h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Strengths</label>
              <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={3}
                placeholder="What did the candidate do well?" className={textareaCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">Areas of Improvement</label>
              <textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} rows={3}
                placeholder="What could be improved?" className={textareaCls} />
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-gray-900">Recommendation</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RECOMMENDATIONS.map((r) => (
                <button key={r} type="button" onClick={() => setRecommendation(r)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    recommendation === r ? 'border-[#6B46C1] bg-purple-50 text-[#6B46C1]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Back
            </button>
            <button type="submit" disabled={saved}
              className="flex-1 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </EmployerShell>
  );
}
