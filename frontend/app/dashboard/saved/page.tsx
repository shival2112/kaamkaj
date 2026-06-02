'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, MapPin, IndianRupee, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SaveButton } from '@/components/jobs/SaveButton';

interface SavedEntry {
  savedAt: string;
  job: {
    id: string; title: string; location: string; type: string;
    salaryMin: number | null; salaryMax: number | null;
    company: { name: string };
  };
}

const TILE_COLORS = ['bg-blue-500','bg-violet-500','bg-green-600','bg-orange-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
function tileColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31;
  return TILE_COLORS[Math.abs(h) % TILE_COLORS.length];
}
function fmtSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const f = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(0)}L` : `₹${(n/1000).toFixed(0)}K`;
  if (min && max) return `${f(min)} – ${f(max)}`;
  return min ? `${f(min)}+` : `Up to ${f(max!)}`;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const { data: nextSession, status: nextStatus } = useSession();
  const clearUser = useAuthStore((s) => s.clearUser);

  const sessionReady = !isLoading && nextStatus !== 'loading';
  const isCandidate =
    (!!user && (user.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase() === 'CANDIDATE') ||
    (!!nextSession?.user && (nextSession.user.role as string ?? '').toUpperCase() === 'CANDIDATE') ||
    (!!user && !(user.user_metadata?.role));

  useEffect(() => {
    if (!sessionReady) return;
    if (!isCandidate) router.replace('/login');
  }, [sessionReady, isCandidate, router]);

  const [saved,   setSaved]   = useState<SavedEntry[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCandidate) return;
    fetch('/api/candidate/saved?limit=50')
      .then(r => r.json())
      .then(d => { setSaved((d as { saved?: SavedEntry[] }).saved ?? []); setTotal((d as { total?: number }).total ?? 0); })
      .catch(err => console.error('[saved] fetch error:', err))
      .finally(() => setLoading(false));
  }, [isCandidate]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? nextSession?.user?.name ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  if (!sessionReady) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }
  if (!isCandidate) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={role} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Saved Jobs</h1>
            {!loading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{total}</span>}
          </div>
          <Link href="/jobs" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
            Browse Jobs
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-24 text-center">
              <Bookmark className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 font-medium text-foreground">No saved jobs</p>
              <p className="mt-1 text-sm text-muted-foreground">Bookmark jobs while browsing to find them here</p>
              <Link href="/jobs" className="mt-4 text-sm font-medium text-primary hover:underline">Browse jobs →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {saved.map(({ job, savedAt }) => {
                const salary = fmtSalary(job.salaryMin, job.salaryMax);
                const color  = tileColor(job.company.name);
                return (
                  <div key={job.id} className="group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white ${color}`}>
                        {job.company.name[0].toUpperCase()}
                      </div>
                      {/* Unsave toggle */}
                      <SaveButton jobId={job.id} initialSaved={true} variant="icon" />
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">{job.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{job.company.name}</p>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />{job.location}
                      </div>
                      {salary && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <IndianRupee className="h-3 w-3 shrink-0" />{salary}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <Link href={`/jobs/${job.id}`}
                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                        <ExternalLink className="h-3 w-3" /> View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
