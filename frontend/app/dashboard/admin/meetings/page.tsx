'use client';

import { useState } from 'react';
import {
  Calendar, Plus, Pencil, Trash2, ExternalLink, Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ScheduleInterviewModal } from '@/components/employer/ScheduleInterviewModal';
import { useEmployerStore } from '@/store/employerStore';
import { type Interview } from '@/data/employerData';

const STATUS_CLS: Record<string, string> = {
  scheduled:  'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; interview: Interview };

export default function AdminMeetingsPage() {
  const user = useAuthStore((s) => s.user);
  const { interviews, candidates, jobs, addInterview, updateInterview, cancelInterview, deleteInterview } =
    useEmployerStore();

  const [modal, setModal]   = useState<ModalState>({ mode: 'closed' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const getName = (cid: string) => candidates.find((c) => c.id === cid)?.name ?? cid;
  const getJob  = (jid: string) => jobs.find((j) => j.id === jid)?.title ?? jid;

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const initials    = displayName[0]?.toUpperCase() ?? 'A';

  const handleSave = (data: Omit<Interview, 'id' | 'status' | 'questions' | 'feedback'>) => {
    if (modal.mode === 'edit') {
      updateInterview(modal.interview.id, data);
    } else {
      addInterview({ ...data, id: `i${Date.now()}`, status: 'scheduled' });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this meeting permanently?')) deleteInterview(id);
  };

  const visible = interviews
    .filter((iv) => filter === 'all' || iv.status === filter)
    .filter((iv) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        getName(iv.candidateId).toLowerCase().includes(q) ||
        getJob(iv.jobId).toLowerCase().includes(q) ||
        iv.round.toLowerCase().includes(q) ||
        iv.interviewer.toLowerCase().includes(q)
      );
    });

  return (
    <>
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidate, job, interviewer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
              <p className="text-sm text-muted-foreground">All scheduled interviews across the platform.</p>
            </div>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Schedule Meeting
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          {[
            { label: 'Total',     count: interviews.length,                                        cls: 'text-gray-900' },
            { label: 'Scheduled', count: interviews.filter(i => i.status === 'scheduled').length,  cls: 'text-blue-700' },
            { label: 'Completed', count: interviews.filter(i => i.status === 'completed').length,  cls: 'text-green-700' },
          ].map(({ label, count, cls }) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className={`text-2xl font-extrabold ${cls}`}>{count}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? `All (${interviews.length})` : `${f} (${interviews.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Candidate', 'Job', 'Round', 'Date & Time', 'Mode', 'Interviewer', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((iv) => (
                  <tr key={iv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">{getName(iv.candidateId)}</td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{getJob(iv.jobId)}</td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{iv.round}</td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      {iv.date}<span className="ml-1 text-gray-400">·</span><span className="ml-1">{iv.time}</span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{iv.mode}</td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{iv.interviewer}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_CLS[iv.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {iv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {iv.status === 'scheduled' && (
                          <>
                            <button onClick={() => setModal({ mode: 'edit', interview: iv })}
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { if (confirm('Cancel this meeting?')) cancelInterview(iv.id); }}
                              className="rounded-lg border border-orange-100 px-2.5 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-50">
                              Cancel
                            </button>
                          </>
                        )}
                        {iv.link && (
                          <a href={`https://${iv.link}`} target="_blank" rel="noopener noreferrer"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50" title="Join link">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(iv.id)}
                          className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No meetings found.{' '}
                      <button onClick={() => setModal({ mode: 'create' })} className="text-primary hover:underline">
                        Schedule one now.
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ScheduleInterviewModal
        open={modal.mode !== 'closed'}
        onClose={() => setModal({ mode: 'closed' })}
        onSave={handleSave}
        candidates={candidates}
        jobs={jobs}
        existing={modal.mode === 'edit' ? modal.interview : undefined}
      />
    </>
  );
}
