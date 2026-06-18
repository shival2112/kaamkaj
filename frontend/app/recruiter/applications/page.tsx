'use client';

import { useEffect, useState, useCallback } from 'react';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import Link from 'next/link';
import { Users, Loader2, UserCheck } from 'lucide-react';

interface App {
  id: string; status: string; appliedAt: string; updatedAt: string;
  assignedRecruiterId: string | null;
  job:       { id: string; title: string };
  candidate: { id: string; name: string; email: string; avatar: string | null };
}

const TABS = ['ALL', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWING:   'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
};

const NEXT_STATUSES: Record<string, string[]> = {
  APPLIED:     ['REVIEWING', 'SHORTLISTED', 'REJECTED'],
  REVIEWING:   ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['HIRED', 'REJECTED'],
  HIRED:       [],
  REJECTED:    [],
};

export default function RecruiterApplicationsPage() {
  const [apps,       setApps]       = useState<App[]>([]);
  const [tab,        setTab]        = useState<Tab>('ALL');
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState<Record<string, boolean>>({});
  const [myId,       setMyId]       = useState<string>('');

  // Grab current recruiter id from Supabase
  useEffect(() => {
    import('@/lib/supabase').then(({ createSupabaseClient }) => {
      createSupabaseClient().auth.getUser().then(({ data: { user } }) => {
        if (user) setMyId(user.id);
      });
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = tab !== 'ALL' ? `?status=${tab}` : '';
    fetch(`/api/recruiter/applications${params}`)
      .then(r => r.json())
      .then((d: { applications?: App[] }) => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    const prev = apps.find(a => a.id === id);
    setApps(list => list.map(a => a.id === id ? { ...a, status } : a));
    const res = await fetch(`/api/recruiter/applications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok && prev) setApps(list => list.map(a => a.id === id ? prev : a));
    setUpdating(p => ({ ...p, [id]: false }));
  };

  const toggleAssign = async (id: string, currentlyAssigned: boolean) => {
    setUpdating(prev => ({ ...prev, [`assign_${id}`]: true }));
    const res = await fetch(`/api/recruiter/applications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignToSelf: !currentlyAssigned }),
    });
    if (res.ok) {
      setApps(list => list.map(a =>
        a.id === id ? { ...a, assignedRecruiterId: currentlyAssigned ? null : myId } : a
      ));
    }
    setUpdating(p => ({ ...p, [`assign_${id}`]: false }));
  };

  const filtered = tab === 'ALL' ? apps : apps.filter(a => a.status === tab);

  return (
    <RecruiterShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Candidates</h1>
          <p className="mt-0.5 text-sm text-gray-500">All applications for your company&apos;s jobs.</p>
        </div>

        {/* Status tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                tab === t ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40'
              }`}>
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Users className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">No candidates in this status</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-5 py-3">
              {['CANDIDATE', 'ROLE', 'STATUS', 'ASSIGNED', 'ACTIONS'].map(h => (
                <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
              ))}
            </div>
            {filtered.map(app => {
              const isAssigned = app.assignedRecruiterId === myId;
              const nextOpts   = NEXT_STATUSES[app.status] ?? [];
              return (
                <div key={app.id}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-5 py-4 last:border-0 hover:bg-gray-50 transition-colors">
                  <div>
                    <Link href={`/recruiter/candidates/${app.candidate.id}`}
                      className="font-semibold text-gray-900 hover:text-primary hover:underline">
                      {app.candidate.name}
                    </Link>
                    <p className="text-xs text-gray-400">{app.candidate.email}</p>
                  </div>
                  <p className="truncate text-sm text-gray-600">{app.job.title}</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                  <button
                    onClick={() => toggleAssign(app.id, isAssigned)}
                    disabled={!!updating[`assign_${app.id}`]}
                    title={isAssigned ? 'Unassign from me' : 'Assign to me'}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      isAssigned
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {updating[`assign_${app.id}`]
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <UserCheck className="h-3 w-3" />}
                    {isAssigned ? 'Mine' : 'Assign'}
                  </button>
                  <div className="flex items-center gap-1">
                    {nextOpts.map(s => (
                      <button key={s} onClick={() => updateStatus(app.id, s)}
                        disabled={!!updating[app.id]}
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50">
                        {updating[app.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
