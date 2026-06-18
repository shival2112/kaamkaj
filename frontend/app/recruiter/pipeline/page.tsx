'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import Link from 'next/link';
import { Columns2 } from 'lucide-react';

interface App {
  id: string; status: string; appliedAt: string;
  job:       { id: string; title: string };
  candidate: { id: string; name: string; email: string };
}

const COLUMNS = [
  { key: 'APPLIED',     label: 'Applied',     color: 'bg-blue-100 text-blue-700',    border: 'border-blue-200'    },
  { key: 'REVIEWING',   label: 'Reviewing',   color: 'bg-yellow-100 text-yellow-700',border: 'border-yellow-200'  },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-100 text-purple-700',border: 'border-purple-200'  },
  { key: 'HIRED',       label: 'Hired',       color: 'bg-green-100 text-green-700',  border: 'border-green-200'   },
  { key: 'REJECTED',    label: 'Rejected',    color: 'bg-red-100 text-red-700',      border: 'border-red-200'     },
] as const;

type ColKey = typeof COLUMNS[number]['key'];

export default function RecruiterPipelinePage() {
  const [apps,    setApps]    = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const dragId  = useRef<string>('');

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/recruiter/applications?page=1')
      .then(r => r.json())
      .then((d: { applications?: App[] }) => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = COLUMNS.reduce<Record<ColKey, App[]>>((acc, col) => {
    acc[col.key] = apps.filter(a => a.status === col.key);
    return acc;
  }, {} as Record<ColKey, App[]>);

  const handleDrop = async (targetStatus: ColKey, e: React.DragEvent) => {
    e.preventDefault();
    const appId = dragId.current;
    if (!appId) return;

    const prev = apps.find(a => a.id === appId);
    if (!prev || prev.status === targetStatus) return;

    // Optimistic update
    setApps(list => list.map(a => a.id === appId ? { ...a, status: targetStatus } : a));

    const res = await fetch(`/api/recruiter/applications/${appId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    });
    // Rollback on error
    if (!res.ok) setApps(list => list.map(a => a.id === appId ? prev : a));
  };

  return (
    <RecruiterShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="mt-0.5 text-sm text-gray-500">Drag candidates between stages to update their status.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <div
                key={col.key}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(col.key, e)}
                className="flex w-64 shrink-0 flex-col rounded-2xl border border-gray-200 bg-gray-50"
              >
                {/* Column header */}
                <div className={`flex items-center justify-between rounded-t-2xl border-b ${col.border} bg-white px-4 py-3`}>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.color}`}>{col.label}</span>
                  <span className="text-xs font-semibold text-gray-400">{grouped[col.key].length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                  {grouped[col.key].length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-8">
                      <Columns2 className="h-6 w-6 text-gray-300" />
                    </div>
                  ) : (
                    grouped[col.key].map(app => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={() => { dragId.current = app.id; }}
                        onDragEnd={() => { dragId.current = ''; }}
                        className="cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                      >
                        <Link href={`/recruiter/candidates/${app.candidate.id}`}
                          className="block font-semibold text-sm text-gray-900 hover:text-primary transition-colors">
                          {app.candidate.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-gray-500 truncate">{app.job.title}</p>
                        <p className="mt-1.5 text-[10px] text-gray-400">
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
