'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import { ArrowLeft, Star, Loader2, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Evaluation {
  id: string;
  techScore: number; commScore: number; problemScore: number;
  cultureFit: number; experienceScore: number;
  recommendation: string;
  strengths: string | null; improvements: string | null; notes: string | null;
  sharedWithEmployer: boolean;
}

const CRITERIA = [
  { key: 'techScore',        label: 'Technical Skills',       desc: 'Code quality, technical knowledge, problem-solving ability' },
  { key: 'commScore',        label: 'Communication',          desc: 'Clarity, articulation, listening skills' },
  { key: 'problemScore',     label: 'Problem Solving',        desc: 'Approach to challenges, creativity, logical thinking' },
  { key: 'cultureFit',       label: 'Culture Fit',            desc: 'Team alignment, values, attitude' },
  { key: 'experienceScore',  label: 'Experience Relevance',   desc: 'Prior work relevant to this role' },
] as const;

type CriteriaKey = typeof CRITERIA[number]['key'];

const SCORE_LABELS = ['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

const REC_OPTIONS = [
  { value: 'PASS',    label: 'Pass',    cls: 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100' },
  { value: 'FAIL',    label: 'Fail',    cls: 'border-red-400 bg-red-50 text-red-700 hover:bg-red-100' },
  { value: 'HOLD',    label: 'Hold',    cls: 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { value: 'NO_SHOW', label: 'No Show', cls: 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100' },
];

type Scores = Record<CriteriaKey, number>;

const DEFAULT_SCORES: Scores = {
  techScore: 0, commScore: 0, problemScore: 0, cultureFit: 0, experienceScore: 0,
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${n} star`}
        >
          <Star
            className={`h-7 w-7 ${
              n <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-transparent text-gray-300'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 self-center text-sm font-medium text-gray-600">
          {SCORE_LABELS[value]}
        </span>
      )}
    </div>
  );
}

export default function EvaluatePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [scores, setScores]     = useState<Scores>(DEFAULT_SCORES);
  const [rec,    setRec]        = useState('');
  const [strengths,    setStrengths]    = useState('');
  const [improvements, setImprovements] = useState('');
  const [notes,        setNotes]        = useState('');
  const [shareFlag,    setShareFlag]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  // Pre-fill if evaluation exists
  useEffect(() => {
    fetch(`/api/recruiter/interviews/${id}/evaluate`)
      .then(r => r.json())
      .then((d: { evaluation?: Evaluation | null }) => {
        if (d.evaluation) {
          const ev = d.evaluation;
          setScores({
            techScore: ev.techScore, commScore: ev.commScore,
            problemScore: ev.problemScore, cultureFit: ev.cultureFit,
            experienceScore: ev.experienceScore,
          });
          setRec(ev.recommendation);
          setStrengths(ev.strengths ?? '');
          setImprovements(ev.improvements ?? '');
          setNotes(ev.notes ?? '');
          setShareFlag(ev.sharedWithEmployer);
        }
      })
      .finally(() => setFetching(false));
  }, [id]);

  const avgScore = Object.values(scores).every(v => v > 0)
    ? (Object.values(scores).reduce((a, b) => a + b, 0) / 5).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(scores).some(v => v === 0)) {
      setError('Please score all 5 criteria.'); return;
    }
    if (!rec) { setError('Please select a recommendation.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/recruiter/interviews/${id}/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scores, recommendation: rec,
          strengths, improvements, notes,
          sharedWithEmployer: shareFlag,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to save evaluation'); return; }
      setSaved(true);
      setTimeout(() => router.push('/recruiter/interviews'), 1800);
    } finally { setLoading(false); }
  };

  const textareaCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none';

  if (fetching) {
    return (
      <RecruiterShell>
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </RecruiterShell>
    );
  }

  if (saved) {
    return (
      <RecruiterShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Evaluation Saved!</h2>
          <p className="mt-2 text-sm text-gray-500">
            {shareFlag ? 'Your evaluation has been shared with the employer.' : 'Evaluation saved privately.'}
          </p>
          <p className="mt-1 text-xs text-gray-400">Redirecting to interviews…</p>
        </div>
      </RecruiterShell>
    );
  }

  return (
    <RecruiterShell>
      <div className="mx-auto max-w-2xl p-6">
        <Link href="/recruiter/interviews"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Interviews
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Interview Evaluation Form</h1>
          <p className="mt-1 text-sm text-gray-500">Score the candidate across 5 criteria, choose your recommendation, and optionally share this report with the employer.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          {/* Criteria scores */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Scoring Criteria</h2>
              {avgScore && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  Avg {avgScore}/5
                </span>
              )}
            </div>
            <div className="space-y-6">
              {CRITERIA.map(({ key, label, desc }) => (
                <div key={key}>
                  <div className="mb-1">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <StarRating
                    value={scores[key]}
                    onChange={v => setScores(prev => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-900">Recommendation</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {REC_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRec(opt.value)}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${
                    rec === opt.value
                      ? opt.cls + ' ring-2 ring-offset-1 ring-current scale-[1.03]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Qualitative feedback */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-gray-900">Detailed Feedback</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Strengths</label>
                <textarea rows={3} value={strengths} onChange={e => setStrengths(e.target.value)}
                  placeholder="What did the candidate do particularly well?" className={textareaCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Areas for Improvement</label>
                <textarea rows={3} value={improvements} onChange={e => setImprovements(e.target.value)}
                  placeholder="What could the candidate improve on?" className={textareaCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Private Notes (not shared)</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Internal notes visible only to recruiters…" className={textareaCls} />
              </div>
            </div>
          </div>

          {/* Share toggle */}
          <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setShareFlag(v => !v)}
              className={`mt-0.5 h-5 w-9 shrink-0 rounded-full border-2 transition-colors ${
                shareFlag ? 'border-primary bg-primary' : 'border-gray-300 bg-gray-100'
              }`}
              aria-pressed={shareFlag}
            >
              <span className={`block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                shareFlag ? 'translate-x-4' : 'translate-x-0.5'
              }`} />
            </button>
            <div>
              <p className="font-semibold text-gray-900">Share with Employer</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Sends a formatted evaluation summary to the employer via email. Private notes are excluded.
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Saving…' : 'Submit Evaluation'}
          </button>
        </form>
      </div>
    </RecruiterShell>
  );
}
