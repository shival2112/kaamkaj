'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job:       { id: string; title: string };
  candidate: { id: string; name: string; email: string };
}

type Columns = Record<string, Application[]>;

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS = [
  { status: 'APPLIED',     label: 'Applied',     headerBg: 'bg-blue-500',   dropBg: 'bg-blue-50/60',   count: 'bg-blue-100 text-blue-700' },
  { status: 'REVIEWING',   label: 'Reviewing',   headerBg: 'bg-sky-500',    dropBg: 'bg-sky-50/60',    count: 'bg-sky-100 text-sky-700' },
  { status: 'SHORTLISTED', label: 'Shortlisted', headerBg: 'bg-yellow-500', dropBg: 'bg-yellow-50/60', count: 'bg-yellow-100 text-yellow-700' },
  { status: 'HIRED',       label: 'Hired',       headerBg: 'bg-green-500',  dropBg: 'bg-green-50/60',  count: 'bg-green-100 text-green-700' },
  { status: 'REJECTED',    label: 'Rejected',    headerBg: 'bg-red-400',    dropBg: 'bg-red-50/60',    count: 'bg-red-100 text-red-600' },
];

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

// ─── Card component ───────────────────────────────────────────────────────────

function KanbanCard({
  app,
  onDragStart,
}: {
  app: Application;
  onDragStart: (e: React.DragEvent, appId: string, fromStatus: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app.id, app.status)}
      className="cursor-grab rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing active:shadow-md select-none"
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${tileColor(app.candidate.name)}`}>
          {app.candidate.name[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-gray-900">{app.candidate.name}</p>
          <p className="truncate text-[10px] text-gray-400">{app.candidate.email}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-[10px] font-medium text-gray-500">{app.job.title}</p>
      <p className="mt-0.5 text-[10px] text-gray-400">
        {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </p>
    </div>
  );
}

// ─── Column component ─────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  cards,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: {
  col: typeof COLUMNS[number];
  cards: Application[];
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, toStatus: string) => void;
  onDragStart: (e: React.DragEvent, appId: string, fromStatus: string) => void;
}) {
  return (
    <div className="flex w-56 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Column header */}
      <div className={`flex items-center justify-between rounded-t-xl px-3 py-2.5 ${col.headerBg}`}>
        <span className="text-xs font-bold text-white">{col.label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.count}`}>
          {cards.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => onDragOver(e, col.status)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, col.status)}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors ${
          isDragOver ? col.dropBg : 'bg-gray-50/40'
        }`}
        style={{ minHeight: '200px', maxHeight: 'calc(100vh - 220px)' }}
      >
        {cards.map(app => (
          <KanbanCard key={app.id} app={app} onDragStart={onDragStart} />
        ))}
        {cards.length === 0 && (
          <div className={`flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-8 text-[10px] text-gray-400 transition-colors ${isDragOver ? 'border-gray-400' : ''}`}>
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [columns,    setColumns]    = useState<Columns>({ APPLIED: [], REVIEWING: [], SHORTLISTED: [], HIRED: [], REJECTED: [] });
  const [loading,    setLoading]    = useState(true);
  const [dragOver,   setDragOver]   = useState<string | null>(null);
  const dragPayload  = useRef<{ appId: string; fromStatus: string } | null>(null);

  // Fetch all applications and bucket into columns
  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/employer/applications?limit=200')
      .then(r => r.ok ? r.json() : { applications: [] })
      .then((d: { applications?: Application[] }) => {
        const apps = d.applications ?? [];
        const cols: Columns = { APPLIED: [], REVIEWING: [], SHORTLISTED: [], HIRED: [], REJECTED: [] };
        apps.forEach(a => {
          if (cols[a.status]) cols[a.status].push(a);
        });
        setColumns(cols);
      })
      .catch(err => console.error('[pipeline] fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Drag handlers ───────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, appId: string, fromStatus: string) => {
    dragPayload.current = { appId, fromStatus };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(toStatus);
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDragOver(null);

    const payload = dragPayload.current;
    dragPayload.current = null;
    if (!payload || payload.fromStatus === toStatus) return;

    const { appId, fromStatus } = payload;

    // Optimistic update — move the card immediately
    setColumns(prev => {
      const app = prev[fromStatus]?.find(a => a.id === appId);
      if (!app) return prev;
      return {
        ...prev,
        [fromStatus]: prev[fromStatus].filter(a => a.id !== appId),
        [toStatus]:   [{ ...app, status: toStatus }, ...(prev[toStatus] ?? [])],
      };
    });

    // Persist to DB
    const res = await fetch(`/api/employer/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: toStatus }),
    });

    if (!res.ok) {
      // Roll back on failure
      console.error('[pipeline] PATCH failed, rolling back');
      load();
    }
  };

  const total = Object.values(columns).flat().length;

  return (
    <EmployerShell>
      <div className="flex h-full flex-col overflow-hidden p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900">Hiring Pipeline</h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-gray-500">
              {total} total application{total !== 1 ? 's' : ''} — drag cards between columns to update stage
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.status}
                col={col}
                cards={columns[col.status] ?? []}
                isDragOver={dragOver === col.status}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </EmployerShell>
  );
}
