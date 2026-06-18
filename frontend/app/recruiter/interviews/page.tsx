'use client';

import { useEffect, useState, useCallback } from 'react';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import Link from 'next/link';
import { Calendar, Plus, Loader2, X, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Interview {
  id: string; round: string; date: string; time: string;
  mode: string; link: string | null; interviewer: string; status: string;
  feedbackOutcome: string | null;
  participant: { id: string; name: string; email: string };
  job: { id: string; title: string } | null;
  evaluation: { id: string; recommendation: string } | null;
}

type Filter = 'upcoming' | 'past' | 'all';

const REC_COLORS: Record<string, string> = {
  PASS:    'bg-green-100 text-green-700',
  FAIL:    'bg-red-100 text-red-700',
  HOLD:    'bg-yellow-100 text-yellow-700',
  NO_SHOW: 'bg-gray-100 text-gray-500',
};

interface ScheduleForm {
  candidateId: string; jobId: string; round: string;
  date: string; time: string; mode: string;
  link: string; interviewer: string;
}
const EMPTY: ScheduleForm = {
  candidateId: '', jobId: '', round: 'Round 1',
  date: '', time: '10:00', mode: 'Video Call',
  link: '', interviewer: '',
};

function ScheduleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (i: Interview) => void }) {
  const [form,    setForm]    = useState<ScheduleForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f: keyof ScheduleForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/recruiter/interviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as Interview & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to schedule'); return; }
      onCreated(data); onClose();
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-gray-900">Schedule Interview</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Candidate ID *</label>
            <input required value={form.candidateId} onChange={set('candidateId')} placeholder="Paste candidate user ID" className={inputCls} />
            <p className="mt-1 text-[11px] text-gray-400">Find it on the Candidates page.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Round *</label>
              <input required value={form.round} onChange={set('round')} placeholder="e.g. Round 1" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Mode *</label>
              <select value={form.mode} onChange={set('mode')} className={inputCls}>
                {['Video Call', 'Phone Call', 'In-Person', 'Technical'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Date *</label>
              <input required type="date" value={form.date} onChange={set('date')} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Time *</label>
              <input required type="time" value={form.time} onChange={set('time')} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Interviewer Name *</label>
            <input required value={form.interviewer} onChange={set('interviewer')} placeholder="e.g. Rahul Sharma" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Meeting Link</label>
            <input value={form.link} onChange={set('link')} placeholder="Zoom / Meet URL (optional)" className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecruiterInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filter,     setFilter]     = useState<Filter>('upcoming');
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/recruiter/interviews?filter=${filter}`)
      .then(r => r.json())
      .then((d: { interviews?: Interview[] }) => setInterviews(d.interviews ?? []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <RecruiterShell>
      {showModal && (
        <ScheduleModal
          onClose={() => setShowModal(false)}
          onCreated={i => setInterviews(prev => [i, ...prev])}
        />
      )}

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Interviews</h1>
            <p className="mt-0.5 text-sm text-gray-500">Schedule and track candidate interviews.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Schedule
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-2">
          {(['upcoming', 'past', 'all'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors capitalize ${
                filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Calendar className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No {filter} interviews</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map(inv => (
              <div key={inv.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  {inv.status === 'scheduled'
                    ? <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    : inv.evaluation?.recommendation === 'PASS' || inv.feedbackOutcome === 'PASS'
                    ? <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
                  <div>
                    <p className="font-semibold text-gray-900">{inv.participant.name}</p>
                    <p className="text-sm text-gray-500">{inv.job?.title ?? 'General Interview'} · {inv.round}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{inv.date} at {inv.time} · {inv.mode}</p>
                    {inv.link && (
                      <a href={inv.link} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline">
                        Join Meeting →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {inv.evaluation ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${REC_COLORS[inv.evaluation.recommendation] ?? 'bg-gray-100 text-gray-500'}`}>
                      {inv.evaluation.recommendation}
                    </span>
                  ) : (
                    <Link href={`/recruiter/interviews/${inv.id}/evaluate`}
                      className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors">
                      Evaluate
                    </Link>
                  )}
                  <Link href={`/recruiter/candidates/${inv.participant.id}`}
                    className="rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:border-primary/40 hover:text-primary transition-colors">
                    Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
