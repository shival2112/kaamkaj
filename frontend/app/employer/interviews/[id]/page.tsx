'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';

type Rating = 'good' | 'average' | 'poor' | null;

interface AiQuestion {
  question: string;
  category: string;
  difficulty: string;
}

interface Meeting {
  id: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  interviewer: string;
  participant: { id: string; name: string };
  job: { id: string; title: string; skills?: string[] } | null;
}

const DIFF_CLS: Record<string, string> = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-600',
};
const CAT_CLS: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700',
  HR: 'bg-purple-100 text-purple-700',
  Behavioral: 'bg-orange-100 text-orange-700',
};

export default function InterviewRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting]     = useState<Meeting | null>(null);
  const [notFound, setNotFound]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [ratings, setRatings]     = useState<Rating[]>([]);
  const [notes, setNotes]         = useState<string[]>([]);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetch(`/api/employer/interviews/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Meeting | null) => {
        if (!data) { setNotFound(true); return; }
        setMeeting(data);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  useEffect(() => {
    if (!meeting) return;
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await fetch('/api/employer/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            round:    meeting!.round,
            jobTitle: meeting!.job?.title ?? 'Software Engineer',
            skills:   meeting!.job?.skills ?? [],
          }),
        });
        const data = (await res.json()) as AiQuestion[];
        setQuestions(data);
        setRatings(data.map(() => null));
        setNotes(data.map(() => ''));
      } catch {
        setError('Failed to generate questions. Using fallback.');
        const fallback: AiQuestion[] = Array.from({ length: 6 }, (_, i) => ({
          question: `Question ${i + 1}: Please tell me about your relevant experience.`,
          category: 'HR',
          difficulty: 'Medium',
        }));
        setQuestions(fallback);
        setRatings(fallback.map(() => null));
        setNotes(fallback.map(() => ''));
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting?.id]);

  if (notFound) {
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
  if (!meeting) {
    return (
      <EmployerShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#6B46C1]" />
        </div>
      </EmployerShell>
    );
  }

  const setRating = (idx: number, r: Rating) =>
    setRatings((prev) => prev.map((v, i) => (i === idx ? r : v)));
  const setNote = (idx: number, t: string) =>
    setNotes((prev) => prev.map((v, i) => (i === idx ? t : v)));

  const finishInterview = () => {
    router.push(`/employer/interviews/${meeting.id}/feedback`);
  };

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="rounded-xl bg-[#6B46C1] p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wide">{meeting.round}</p>
              <h1 className="mt-1 text-xl font-extrabold">{meeting.participant.name}</h1>
              <p className="text-purple-200 text-sm">{meeting.job?.title ?? 'Role'} · {meeting.date} at {meeting.time}</p>
            </div>
            <div className="text-right text-sm text-purple-200">
              <p>{meeting.mode}</p>
              <p>Interviewer: {meeting.interviewer}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#6B46C1]" />
              <p className="mt-3 text-sm text-gray-500">Generating AI interview questions…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">{error}</div>
              )}
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start gap-2 mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CAT_CLS[q.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {q.category}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${DIFF_CLS[q.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                        {q.difficulty}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">Q{i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-relaxed">{q.question}</p>

                    {/* Rating buttons */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">Rating:</span>
                      {[
                        { r: 'good' as Rating, label: '✅ Good', cls: ratings[i] === 'good' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100' },
                        { r: 'average' as Rating, label: '⚠️ Average', cls: ratings[i] === 'average' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
                        { r: 'poor' as Rating, label: '❌ Poor', cls: ratings[i] === 'poor' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100' },
                      ].map(({ r, label, cls }) => (
                        <button key={r} onClick={() => setRating(i, r)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${cls}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={notes[i]}
                      onChange={(e) => setNote(i, e.target.value)}
                      placeholder="Add notes for this question…"
                      rows={2}
                      className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:border-[#6B46C1] focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => router.back()}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Back
                </button>
                <button onClick={finishInterview}
                  className="flex-1 rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700">
                  Finish Interview &amp; Give Feedback →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </EmployerShell>
  );
}
