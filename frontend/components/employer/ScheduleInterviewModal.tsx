'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ROUNDS = ['HR Round', 'Technical Round', 'Final Round', 'Managerial Round', 'Group Discussion'];
const MODES  = ['Online', 'In-Person', 'Phone'];

export interface ModalCandidate { id: string; name: string; jobId: string }
export interface ModalJob       { id: string; title: string }

export interface FormData {
  candidateId: string;
  jobId: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  link: string;
  interviewer: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  candidates: ModalCandidate[];
  jobs: ModalJob[];
  /** Pre-fill candidate when scheduling from candidate profile */
  prefillCandidateId?: string;
  /** Pre-fill existing interview for Edit mode */
  existing?: FormData & { id: string };
}

const EMPTY: FormData = {
  candidateId: '',
  jobId: '',
  round: ROUNDS[0],
  date: '',
  time: '',
  mode: MODES[0],
  link: '',
  interviewer: '',
};

export function ScheduleInterviewModal({
  open,
  onClose,
  onSave,
  candidates,
  jobs,
  prefillCandidateId,
  existing,
}: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = existing;
      setForm(rest);
    } else {
      setForm({ ...EMPTY, candidateId: prefillCandidateId ?? '' });
    }
    setErrors({});
  }, [open, existing, prefillCandidateId]);

  // Auto-fill jobId when candidate changes (if candidate has only one job)
  useEffect(() => {
    if (!form.candidateId || existing) return;
    const c = candidates.find((c) => c.id === form.candidateId);
    if (c) setForm((f) => ({ ...f, jobId: c.jobId }));
  }, [form.candidateId, candidates, existing]);

  const set = (key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.candidateId) e.candidateId = 'Select a candidate';
    if (!form.jobId)       e.jobId       = 'Select a job';
    if (!form.date)        e.date        = 'Pick a date';
    if (!form.time)        e.time        = 'Pick a time';
    if (!form.interviewer) e.interviewer = 'Enter interviewer name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  if (!open) return null;

  const inputCls = (field: keyof FormData) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">{existing ? 'Edit Interview' : 'Schedule Interview'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Candidate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Candidate *</label>
              <select value={form.candidateId} onChange={(e) => set('candidateId', e.target.value)}
                className={inputCls('candidateId')} disabled={!!prefillCandidateId && !existing}>
                <option value="">Select candidate</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.candidateId && <p className="mt-0.5 text-[11px] text-red-500">{errors.candidateId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Job *</label>
              <select value={form.jobId} onChange={(e) => set('jobId', e.target.value)}
                className={inputCls('jobId')}>
                <option value="">Select job</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              {errors.jobId && <p className="mt-0.5 text-[11px] text-red-500">{errors.jobId}</p>}
            </div>
          </div>

          {/* Round + Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Round *</label>
              <select value={form.round} onChange={(e) => set('round', e.target.value)}
                className={inputCls('round')}>
                {ROUNDS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Mode *</label>
              <select value={form.mode} onChange={(e) => set('mode', e.target.value)}
                className={inputCls('mode')}>
                {MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Date *</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className={inputCls('date')} />
              {errors.date && <p className="mt-0.5 text-[11px] text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Time *</label>
              <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)}
                className={inputCls('time')} />
              {errors.time && <p className="mt-0.5 text-[11px] text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* Interviewer */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Interviewer Name *</label>
            <input type="text" placeholder="e.g. Neha Kapoor" value={form.interviewer}
              onChange={(e) => set('interviewer', e.target.value)} className={inputCls('interviewer')} />
            {errors.interviewer && <p className="mt-0.5 text-[11px] text-red-500">{errors.interviewer}</p>}
          </div>

          {/* Meeting link (optional) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Meeting Link <span className="text-gray-400">(optional)</span></label>
            <input type="text" placeholder="e.g. meet.google.com/abc-xyz" value={form.link}
              onChange={(e) => set('link', e.target.value)} className={inputCls('link')} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-[#6B46C1] py-2.5 text-sm font-bold text-white hover:bg-purple-700">
              {existing ? 'Save Changes' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
