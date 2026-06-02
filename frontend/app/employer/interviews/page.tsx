'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Video, Plus, Pencil, Trash2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
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

export default function InterviewsPage() {
  const router = useRouter();
  const { interviews, candidates, jobs, addInterview, updateInterview, cancelInterview, deleteInterview } =
    useEmployerStore();

  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const getName = (cid: string) => candidates.find((c) => c.id === cid)?.name ?? cid;
  const getJob  = (jid: string) => jobs.find((j) => j.id === jid)?.title ?? jid;

  const visible = filter === 'all' ? interviews : interviews.filter((i) => i.status === filter);

  const handleSave = (data: Omit<Interview, 'id' | 'status' | 'questions' | 'feedback'>) => {
    if (modal.mode === 'edit') {
      updateInterview(modal.interview.id, data);
    } else {
      addInterview({
        ...data,
        id: `i${Date.now()}`,
        status: 'scheduled',
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this interview? This cannot be undone.')) deleteInterview(id);
  };

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Interviews</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all scheduled and completed interviews.</p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 rounded-xl bg-[#6B46C1] px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" /> Schedule Interview
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-[#6B46C1] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? `All (${interviews.length})` : `${f} (${interviews.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {['Candidate', 'Job', 'Round', 'Date', 'Time', 'Mode', 'Interviewer', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((iv) => (
                  <tr key={iv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      <Link href={`/employer/candidates/${iv.candidateId}`} className="hover:text-[#6B46C1]">
                        {getName(iv.candidateId)}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{getJob(iv.jobId)}</td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{iv.round}</td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{iv.date}</td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{iv.time}</td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{iv.mode}</td>
                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">{iv.interviewer}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_CLS[iv.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {iv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {iv.status === 'scheduled' && (
                          <>
                            <button onClick={() => router.push(`/employer/interviews/${iv.id}`)}
                              className="flex items-center gap-1 rounded-lg bg-[#6B46C1] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700">
                              <Video className="h-3 w-3" /> Start
                            </button>
                            <button onClick={() => setModal({ mode: 'edit', interview: iv })}
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                              title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { if (confirm('Cancel this interview?')) cancelInterview(iv.id); }}
                              className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                              Cancel
                            </button>
                          </>
                        )}
                        {iv.status === 'completed' && (
                          <Link href={`/employer/interviews/${iv.id}/feedback`}
                            className="rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                            Feedback
                          </Link>
                        )}
                        {iv.link && (
                          <a href={`https://${iv.link}`} target="_blank" rel="noopener noreferrer"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            title="Join link">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(iv.id)}
                          className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50"
                          title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                      No interviews found.{' '}
                      <button onClick={() => setModal({ mode: 'create' })} className="text-[#6B46C1] hover:underline">
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
    </EmployerShell>
  );
}
