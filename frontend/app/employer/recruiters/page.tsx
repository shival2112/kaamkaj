'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Loader2, Trash2, X, Users2 } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';

interface Recruiter {
  id: string; name: string; email: string;
  isVerified: boolean; createdAt: string;
}

function AddRecruiterModal({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated: (r: Recruiter) => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (f: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/employer/recruiters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as Recruiter & { error?: string };
      if (!res.ok) { setError(data.error ?? 'Failed to add recruiter'); return; }
      onCreated(data); onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#6B46C1]" />
            <h2 className="font-semibold text-gray-900">Add Recruiter</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Full Name</label>
            <input required value={form.name} onChange={set('name')} placeholder="e.g. Rahul Verma"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6B46C1] focus:outline-none focus:ring-1 focus:ring-[#6B46C1]/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Email Address</label>
            <input required type="email" value={form.email} onChange={set('email')} placeholder="rahul@company.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6B46C1] focus:outline-none focus:ring-1 focus:ring-[#6B46C1]/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Temporary Password</label>
            <input required type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#6B46C1] focus:outline-none focus:ring-1 focus:ring-[#6B46C1]/30" />
            <p className="mt-1 text-[11px] text-gray-400">Recruiter can change this after first login.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#6B46C1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a3aa8] transition-colors disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Recruiter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecruitersPage() {
  const [recruiters,   setRecruiters]   = useState<Recruiter[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [deleteMap,    setDeleteMap]    = useState<Record<string, boolean>>({});
  const [error,        setError]        = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/employer/recruiters')
      .then(r => r.json())
      .then((d: { recruiters?: Recruiter[] }) => setRecruiters(d.recruiters ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove recruiter "${name}"? They will lose access immediately.`)) return;
    setDeleteMap(prev => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/employer/recruiters?id=${id}`, { method: 'DELETE' });
    if (res.ok) setRecruiters(prev => prev.filter(r => r.id !== id));
    else {
      const d = await res.json() as { error?: string };
      setError(d.error ?? 'Failed to remove recruiter');
    }
    setDeleteMap(prev => ({ ...prev, [id]: false }));
  };

  return (
    <EmployerShell>
      {showModal && (
        <AddRecruiterModal
          onClose={() => setShowModal(false)}
          onCreated={(r) => setRecruiters(prev => [r, ...prev])}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recruiters</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Team members who help you manage hiring. Full recruiter admin coming soon.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#6B46C1] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5a3aa8]"
          >
            <UserPlus className="h-4 w-4" /> Add Recruiter
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
          </div>
        ) : recruiters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Users2 className="h-10 w-10 text-gray-300" />
            <p className="mt-3 font-semibold text-gray-700">No recruiters yet</p>
            <p className="mt-1 text-sm text-gray-400">Add team members to help manage your hiring pipeline.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#6B46C1] px-4 py-2 text-sm font-bold text-white hover:bg-[#5a3aa8] transition-colors"
            >
              <UserPlus className="h-4 w-4" /> Add your first recruiter
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['RECRUITER', 'EMAIL', 'ADDED', 'ACTIONS'] as const).map(col => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{col}</span>
              ))}
            </div>
            {recruiters.map(r => (
              <div key={r.id}
                className="grid grid-cols-[2fr_2fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6B46C1]/10 text-xs font-bold text-[#6B46C1]">
                    {r.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-900">{r.name}</p>
                </div>
                <p className="truncate text-sm text-gray-500">{r.email}</p>
                <p className="text-sm text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <button
                  onClick={() => handleDelete(r.id, r.name)}
                  disabled={deleteMap[r.id]}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  {deleteMap[r.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Future note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Recruiter dashboard (separate admin view) is coming in a future update.
        </p>
      </div>
    </EmployerShell>
  );
}
