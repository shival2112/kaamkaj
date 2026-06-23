'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';

const RECOMMENDATIONS = [
  'Move to Next Round',
  'Final Select',
  'On Hold',
  'Reject',
] as const;

const OUTCOME_MAP: Record<string, string> = {
  'Move to Next Round': 'PASSED',
  'Final Select':       'PASSED',
  'On Hold':             'FAILED',
  'Reject':              'FAILED',
};

interface Meeting {
  id: string;
  round: string;
  participant: { id: string; name: string };
  job: { id: string; title: string } | null;
}

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

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [overall,         setOverall]        = useState(7);
  const [technical,       setTechnical]      = useState(7);
  const [communication,   setCommunication]  = useState(7);
  const [culturalFit,     setCulturalFit]    = useState(7);
  const [problemSolving,  setProblemSolving] = useState(7);
  const [strengths,       setStrengths]      = useState('');
  const [improvements,    setImprovements]   = useState('');
  const [recommendation,  setRecommendation] = useState<string>(RECOMMENDATIONS[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/employer/interviews/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Meeting | null) => {
        if (!data) { setNotFound(true); return; }
        setMeeting(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <EmployerShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#6B46C1]" />
        </div>
      </EmployerShell>
    );
  }

  if (notFound || !meeting) {
    return (
      <EmployerShell>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm font-medium text-gray-600">Interview not found or you don&apos;t have access.</p>
          <button onClick={() => router.push('/employer/interviews')} className="text-sm text-[#6B46C1] hover:underline">
            Back to Interviews
          </button>
        </div>
      </EmployerShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/employer/interviews/${params.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: OUTCOME_MAP[recommendation] ?? 'PASSED',
          rating:  Math.max(1, Math.round(overall / 2)),
          notes:   [strengths && `Strengths: ${strengths}`, improvements && `Improvements: ${improvements}`].filter(Boolean).join('\n'),
        }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; setError(d.error ?? 'Failed to save feedback'); return; }

      // Mark the interview itself as completed
      await fetch(`/api/employer/interviews/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      setSaved(true);
      setTimeout(() => router.push(`/employer/candidates/${meeting.participant.id}`), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const textareaCls = 'w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#6B46C1] focus:outline-none';

  return (
    <EmployerShell>
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Post Interview Feedback</h1>
        <p className="mt-1 text-sm text-gray-500">
          {meeting.round} for candidate {meeting.participant.name}
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        )}
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
            <button type="submit" disabled={saved || submitting}
              className="flex-1 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60">
              {submitting ? 'Saving…' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </EmployerShell>
  );
}
