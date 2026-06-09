'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, Pencil, Trash2, ExternalLink, Search, Bell, Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  AdminScheduleInterviewModal,
  type AdminInterviewFormData,
  type AdminMeeting,
} from '@/components/admin/AdminScheduleInterviewModal';
import { useToast, ToastContainer } from '@/components/ui/Toast';

const STATUS_CLS: Record<string, string> = {
  scheduled:  'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-gray-100 text-gray-500',
};

type ModalState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; meeting: AdminMeeting };

export default function AdminMeetingsPage() {
  const user = useAuthStore((s) => s.user);

  const [meetings, setMeetings]       = useState<AdminMeeting[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [modal, setModal]             = useState<ModalState>({ mode: 'closed' });
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [notifying, setNotifying]     = useState<string | null>(null); // meeting ID being notified
  const { toasts, addToast, dismiss } = useToast();

  // ── Fetch all meetings from DB ──────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/meetings');
      if (res.ok) {
        const data = await res.json() as { meetings: AdminMeeting[] };
        setMeetings(data.meetings ?? []);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (data: AdminInterviewFormData) => {
    const res = await fetch('/api/admin/meetings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json() as AdminMeeting;
      setMeetings((prev) => [created, ...prev]);
      addToast({ title: 'Meeting scheduled', message: 'Notification sent to participant', variant: 'success' });
    } else {
      addToast({ title: 'Failed to schedule meeting', variant: 'error' });
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (data: AdminInterviewFormData) => {
    if (modal.mode !== 'edit') return;
    const res = await fetch(`/api/admin/meetings/${modal.meeting.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json() as AdminMeeting;
      setMeetings((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      addToast({ title: 'Meeting updated', variant: 'success' });
    } else {
      addToast({ title: 'Failed to update meeting', variant: 'error' });
    }
  };

  // ── Cancel status ───────────────────────────────────────────────────────────
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this meeting?')) return;
    const res = await fetch(`/api/admin/meetings/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) {
      setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, status: 'cancelled' } : m));
      addToast({ title: 'Meeting cancelled', variant: 'warning' });
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting permanently?')) return;
    const res = await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      addToast({ title: 'Meeting deleted', variant: 'success' });
    } else {
      addToast({ title: 'Failed to delete meeting', variant: 'error' });
    }
  };

  // ── Notify ──────────────────────────────────────────────────────────────────
  const handleNotify = async (id: string) => {
    setNotifying(id);
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, { method: 'POST' });
      if (res.ok) addToast({ title: 'Notification sent', variant: 'success' });
      else addToast({ title: 'Notification failed', variant: 'error' });
    } catch {
      addToast({ title: 'Notification failed', variant: 'error' });
    } finally {
      setNotifying(null);
    }
  };

  // ── Save dispatcher ─────────────────────────────────────────────────────────
  const handleSave = (data: AdminInterviewFormData) => {
    if (modal.mode === 'edit') {
      handleEdit(data);
    } else {
      handleCreate(data);
    }
  };

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const initials    = displayName[0]?.toUpperCase() ?? 'A';

  const visible = meetings
    .filter((m) => filter === 'all' || m.status === filter)
    .filter((m) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        m.participant.name.toLowerCase().includes(q) ||
        (m.job?.title ?? '').toLowerCase().includes(q) ||
        m.round.toLowerCase().includes(q) ||
        m.interviewer.toLowerCase().includes(q)
      );
    });

  const count = (s: string) => meetings.filter((m) => m.status === s).length;

  return (
    <>
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search participant, job, interviewer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="ml-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {initials}
          </div>
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
            { label: 'Total',     count: meetings.length,       cls: 'text-gray-900' },
            { label: 'Scheduled', count: count('scheduled'),    cls: 'text-blue-700' },
            { label: 'Completed', count: count('completed'),    cls: 'text-green-700' },
          ].map(({ label, count: c, cls }) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className={`text-2xl font-extrabold ${cls}`}>{c}</p>
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
              {f === 'all'
                ? `All (${meetings.length})`
                : `${f} (${count(f)})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loadingList ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    {['Participant', 'Role', 'Job', 'Round', 'Date & Time', 'Mode', 'Interviewer', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visible.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">
                        {m.participant.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.participant.role === 'CANDIDATE'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          {m.participant.role === 'CANDIDATE' ? 'Candidate' : 'Employer'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {m.job?.title ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{m.round}</td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {m.date}<span className="ml-1 text-gray-400">·</span><span className="ml-1">{m.time}</span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{m.mode}</td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{m.interviewer}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_CLS[m.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {/* Edit */}
                          {m.status === 'scheduled' && (
                            <button
                              onClick={() => setModal({ mode: 'edit', meeting: m })}
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                              title="Edit meeting"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {/* Cancel */}
                          {m.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancel(m.id)}
                              className="rounded-lg border border-orange-100 px-2.5 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-50"
                            >
                              Cancel
                            </button>
                          )}
                          {/* Join link */}
                          {m.link && (
                            <a
                              href={m.link.startsWith('http') ? m.link : `https://${m.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                              title="Join meeting link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {/* Notify / Remind */}
                          <button
                            onClick={() => handleNotify(m.id)}
                            disabled={notifying === m.id}
                            className="rounded-lg border border-violet-100 p-1.5 text-violet-500 hover:bg-violet-50 disabled:opacity-40"
                            title="Re-send notification"
                          >
                            {notifying === m.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Bell className="h-3.5 w-3.5" />
                            }
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && !loadingList && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
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
          )}
        </div>
      </div>

      <AdminScheduleInterviewModal
        open={modal.mode !== 'closed'}
        onClose={() => setModal({ mode: 'closed' })}
        onSave={handleSave}
        existing={modal.mode === 'edit' ? modal.meeting : undefined}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
