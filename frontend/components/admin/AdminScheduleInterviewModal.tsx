'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ROUNDS = ['HR Round', 'Technical Round', 'Final Round', 'Managerial Round', 'Group Discussion'];
const MODES  = ['Online', 'In-Person', 'Phone'];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER';
}

export interface AdminJob {
  id: string;
  title: string;
}

export interface AdminInterviewFormData {
  userId: string;
  jobId: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  link: string;
  interviewer: string;
}

export interface AdminMeeting {
  id: string;
  userId: string;
  jobId: string | null;
  round: string;
  date: string;
  time: string;
  mode: string;
  link: string | null;
  interviewer: string;
  status: string;
  participant: { id: string; name: string; email: string; role: string };
  job: { id: string; title: string } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: AdminInterviewFormData) => void;
  /** Pass an existing meeting to enter edit mode */
  existing?: AdminMeeting;
  /** Called once users + jobs are loaded so the parent can build a lookup cache */
  onDataLoaded?: (users: AdminUser[], jobs: AdminJob[]) => void;
}

const EMPTY: AdminInterviewFormData = {
  userId: '',
  jobId: '',
  round: ROUNDS[0],
  date: '',
  time: '',
  mode: MODES[0],
  link: '',
  interviewer: '',
};

type RoleFilter = 'ALL' | 'CANDIDATE' | 'EMPLOYER';

export function AdminScheduleInterviewModal({
  open,
  onClose,
  onSave,
  existing,
  onDataLoaded,
}: Props) {
  const [form, setForm]             = useState<AdminInterviewFormData>(EMPTY);
  const [errors, setErrors]         = useState<Partial<Record<keyof AdminInterviewFormData, string>>>({});
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [jobs, setJobs]             = useState<AdminJob[]>([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (existing) {
      setForm({
        userId:      existing.userId,
        jobId:       existing.jobId ?? '',
        round:       existing.round,
        date:        existing.date,
        time:        existing.time,
        mode:        existing.mode,
        link:        existing.link ?? '',
        interviewer: existing.interviewer,
      });
      // Pre-set filter based on existing participant role
      const r = existing.participant.role as RoleFilter;
      setRoleFilter(['CANDIDATE', 'EMPLOYER'].includes(r) ? r : 'ALL');
    } else {
      setForm(EMPTY);
      setRoleFilter('ALL');
    }

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, jobsRes] = await Promise.all([
        fetch('/api/admin/meetings/users'),
        fetch('/api/admin/meetings/jobs'),
      ]);
      let loadedUsers: AdminUser[] = [];
      let loadedJobs: AdminJob[]   = [];
      if (usersRes.ok) {
        const d = await usersRes.json() as { users: AdminUser[] };
        loadedUsers = d.users ?? [];
        setUsers(loadedUsers);
      }
      if (jobsRes.ok) {
        const d = await jobsRes.json() as { jobs: AdminJob[] };
        loadedJobs = d.jobs ?? [];
        setJobs(loadedJobs);
      }
      onDataLoaded?.(loadedUsers, loadedJobs);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = roleFilter === 'ALL'
    ? users
    : users.filter((u) => u.role === roleFilter);

  const set = (key: keyof AdminInterviewFormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.userId)      e.userId      = 'Select a user';
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

  const inputCls = (field: keyof AdminInterviewFormData) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/30 ${
      errors[field] ? 'border-red-300' : 'border-gray-200'
    }`;

  const rolePill = (r: RoleFilter, label: string) => (
    <button
      key={r}
      type="button"
      onClick={() => { setRoleFilter(r); if (!existing) set('userId', ''); }}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        roleFilter === r
          ? 'bg-primary text-white'
          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">
            {existing ? 'Edit Interview' : 'Schedule Interview'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Role filter + User dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Participant *</label>
            <div className="mb-2 flex gap-1.5">
              {rolePill('ALL',       'All')}
              {rolePill('CANDIDATE', 'Candidates')}
              {rolePill('EMPLOYER',  'Employers')}
            </div>
            <select
              value={form.userId}
              onChange={(e) => set('userId', e.target.value)}
              className={inputCls('userId')}
              disabled={loading || !!existing}
            >
              <option value="">
                {loading
                  ? 'Loading users…'
                  : `Select ${roleFilter === 'ALL' ? 'user' : roleFilter.toLowerCase()} (${filteredUsers.length})`}
              </option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email} [{u.role === 'CANDIDATE' ? 'Candidate' : 'Employer'}]
                </option>
              ))}
              {/* Keep existing participant visible even if not in filtered list */}
              {existing && !filteredUsers.find(u => u.id === existing.userId) && (
                <option value={existing.userId}>
                  {existing.participant.name} — {existing.participant.email}
                </option>
              )}
            </select>
            {errors.userId && <p className="mt-0.5 text-[11px] text-red-500">{errors.userId}</p>}
          </div>

          {/* Job dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Job *</label>
            <select
              value={form.jobId}
              onChange={(e) => set('jobId', e.target.value)}
              className={inputCls('jobId')}
              disabled={loading}
            >
              <option value="">{loading ? 'Loading jobs…' : `Select job (${jobs.length})`}</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
              {/* Keep existing job visible if it's no longer in the active list */}
              {existing?.job && !jobs.find(j => j.id === existing.job!.id) && (
                <option value={existing.job.id}>{existing.job.title}</option>
              )}
            </select>
            {errors.jobId && <p className="mt-0.5 text-[11px] text-red-500">{errors.jobId}</p>}
          </div>

          {/* Round + Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Round *</label>
              <select value={form.round} onChange={(e) => set('round', e.target.value)} className={inputCls('round')}>
                {ROUNDS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Mode *</label>
              <select value={form.mode} onChange={(e) => set('mode', e.target.value)} className={inputCls('mode')}>
                {MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Date *</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputCls('date')} />
              {errors.date && <p className="mt-0.5 text-[11px] text-red-500">{errors.date}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Time *</label>
              <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} className={inputCls('time')} />
              {errors.time && <p className="mt-0.5 text-[11px] text-red-500">{errors.time}</p>}
            </div>
          </div>

          {/* Interviewer */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Interviewer Name *</label>
            <input
              type="text"
              placeholder="e.g. Neha Kapoor"
              value={form.interviewer}
              onChange={(e) => set('interviewer', e.target.value)}
              className={inputCls('interviewer')}
            />
            {errors.interviewer && <p className="mt-0.5 text-[11px] text-red-500">{errors.interviewer}</p>}
          </div>

          {/* Meeting link */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Meeting Link <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. meet.google.com/abc-xyz"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              className={inputCls('link')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#6B46C1] py-2.5 text-sm font-bold text-white hover:bg-purple-700"
            >
              {existing ? 'Save Changes' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
