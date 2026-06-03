'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, IndianRupee, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const KEY = 'kk_recently_viewed';

const TILE_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-600',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
];
function tileColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

interface Job {
  id: string; title: string; location: string;
  type: string; salaryMin?: number | null; salaryMax?: number | null;
  createdAt: string;
  company: { id: string; name: string };
}

export function RecentlyViewedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    try {
      const raw  = localStorage.getItem(KEY);
      const ids  = raw ? (JSON.parse(raw) as string[]) : [];
      if (ids.length === 0) return;

      fetch(`/api/jobs/batch?ids=${ids.join(',')}`)
        .then(r => r.json())
        .then((data: { jobs?: Job[] }) => setJobs(data.jobs ?? []))
        .catch(() => {/* non-fatal */});
    } catch {/* localStorage unavailable */}
  }, []);

  if (jobs.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recently Viewed</h2>
        <Link href="/jobs" className="text-xs font-medium text-primary hover:underline">
          Browse all →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {jobs.map(job => {
          const color  = tileColor(job.company.name);
          const salary = formatSalary(job.salaryMin, job.salaryMax);
          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group flex w-56 shrink-0 flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white', color)}>
                {job.company.name[0].toUpperCase()}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                {job.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{job.company.name}</p>
              <div className="mt-auto pt-2 space-y-1">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />{job.location}
                </p>
                {salary && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IndianRupee className="h-3 w-3 shrink-0" />{salary}
                  </p>
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />{timeAgo(job.createdAt)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
