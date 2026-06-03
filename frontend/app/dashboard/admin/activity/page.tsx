'use client';

import { useEffect, useState } from 'react';
import { Activity, User, Briefcase, Send, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string; type: string; icon: string;
  summary: string; detail: string; timestamp: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  user:        <User        className="h-4 w-4" />,
  briefcase:   <Briefcase   className="h-4 w-4" />,
  send:        <Send        className="h-4 w-4" />,
};

const TYPE_STYLES: Record<string, string> = {
  user_registered:       'bg-blue-50 text-blue-600',
  job_posted:            'bg-violet-50 text-violet-600',
  application_submitted: 'bg-green-50 text-green-600',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export default function AdminActivityPage() {
  const user = useAuthStore(s => s.user);
  const [events,   setEvents]   = useState<ActivityEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true); else setLoading(true);
    try {
      const res  = await fetch('/api/admin/activity');
      const data = await res.json() as { events?: ActivityEvent[] };
      setEvents(data.events ?? []);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { if (user) load(); }, [user]);

  const counts = {
    users: events.filter(e => e.type === 'user_registered').length,
    jobs:  events.filter(e => e.type === 'job_posted').length,
    apps:  events.filter(e => e.type === 'application_submitted').length,
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-foreground">Activity Log</h1>
          {!loading && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {events.length}
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Summary chips */}
        {!loading && (
          <div className="mb-5 flex flex-wrap gap-3">
            {[
              { label: 'New users',    count: counts.users, style: 'bg-blue-50 text-blue-700 border-blue-100' },
              { label: 'Jobs posted',  count: counts.jobs,  style: 'bg-violet-50 text-violet-700 border-violet-100' },
              { label: 'Applications', count: counts.apps,  style: 'bg-green-50 text-green-700 border-green-100' },
            ].map(({ label, count, style }) => (
              <div key={label} className={cn('rounded-xl border px-4 py-2.5 text-sm font-medium', style)}>
                <span className="text-xl font-bold">{count}</span>
                <span className="ml-2 text-xs">{label} (recent)</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No activity yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {events.map((ev, i) => (
                <li key={ev.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Timeline dot */}
                  <div className="mt-0.5 flex flex-col items-center gap-1">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', TYPE_STYLES[ev.type] ?? 'bg-gray-100 text-gray-500')}>
                      {ICON_MAP[ev.icon] ?? <Activity className="h-4 w-4" />}
                    </div>
                    {i < events.length - 1 && <div className="w-px flex-1 bg-gray-100" style={{ minHeight: 16 }} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-sm font-semibold text-foreground">{ev.summary}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ev.detail}</p>
                  </div>

                  {/* Time */}
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={ev.timestamp}>
                    {timeAgo(ev.timestamp)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
