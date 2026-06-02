'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ExternalLink, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useEmployerStore } from '@/store/employerStore';

const STATUS_CLS: Record<string, { bg: string; text: string; label: string }> = {
  scheduled:  { bg: 'bg-blue-50',  text: 'text-blue-700',  label: 'Upcoming' },
  completed:  { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
  cancelled:  { bg: 'bg-gray-100', text: 'text-gray-500',  label: 'Cancelled' },
};

export default function CandidateInterviewsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);
  const { interviews, jobs } = useEmployerStore();

  const userRole = ((user?.user_metadata?.role as string) ?? 'CANDIDATE').toUpperCase();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole !== 'CANDIDATE') router.replace('/dashboard');
    }
  }, [user, isLoading, userRole, router]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';

  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser();
    router.push('/');
  };

  // In the demo, all "scheduled" interviews are shown as the candidate's upcoming ones.
  // A real implementation would filter by the logged-in candidate's DB id.
  const upcoming  = interviews.filter((i) => i.status === 'scheduled');
  const past      = interviews.filter((i) => i.status !== 'scheduled');

  const getJobTitle = (jid: string) => jobs.find((j) => j.id === jid)?.title ?? 'Unknown Role';

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role={dbUser?.role ?? 'CANDIDATE'} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">My Interviews</h1>
              <p className="text-xs text-muted-foreground">Scheduled and past interviews</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Upcoming */}
          <section>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-xl bg-white p-10 text-center shadow-sm">
                <Calendar className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm font-semibold text-gray-600">No upcoming interviews</p>
                <p className="mt-1 text-xs text-gray-400">Keep applying — interviews will appear here once scheduled.</p>
                <Link href="/jobs" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((iv) => {
                  const s = STATUS_CLS[iv.status]!;
                  return (
                    <div key={iv.id} className="rounded-xl bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">{iv.round}</span>
                          </div>
                          <h3 className="mt-2 font-bold text-gray-900">{getJobTitle(iv.jobId)}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" /> {iv.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {iv.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {iv.mode}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            Interviewer: <span className="font-medium text-gray-600">{iv.interviewer}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {iv.link && (
                            <a href={`https://${iv.link}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90">
                              <ExternalLink className="h-3.5 w-3.5" /> Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Past */}
          {past.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Past Interviews ({past.length})
              </h2>
              <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left">
                      {['Role', 'Round', 'Date', 'Mode', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {past.map((iv) => {
                      const s = STATUS_CLS[iv.status] ?? STATUS_CLS.cancelled!;
                      return (
                        <tr key={iv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{getJobTitle(iv.jobId)}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{iv.round}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{iv.date}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{iv.mode}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
