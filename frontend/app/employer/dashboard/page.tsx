'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { EmployerShell } from '@/components/employer/EmployerShell';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';

// Normalise DB enum values to the lowercase strings the JSX expects
function normaliseType(t: string) {
  const map: Record<string, string> = {
    FULL_TIME: 'Full-time', PART_TIME: 'Part-time',
    REMOTE: 'Remote', CONTRACT: 'Contract', INTERNSHIP: 'Internship',
  };
  return map[t] ?? t;
}
function normaliseStatus(s: string): 'active' | 'paused' | 'closed' {
  if (s === 'ACTIVE') return 'active';
  if (s === 'DRAFT')  return 'paused';
  return 'closed';
}

interface DbJob {
  id: string; title: string; location: string; type: string; status: string;
  _count: { applications: number };
}

export default function EmployerDashboardPage() {
  const { user } = useAuth();               // Supabase employer
  const { data: nextSession } = useSession(); // NextAuth phone employer

  // An employer is authenticated via EITHER auth mechanism
  const isEmployer =
    (!!user && (user.user_metadata?.role as string ?? '').toUpperCase() === 'EMPLOYER') ||
    (!!nextSession?.user && (nextSession.user.role as string ?? '').toUpperCase() === 'EMPLOYER');

  const [jobs,            setJobs]           = useState<DbJob[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [newToday,        setNewToday]        = useState(0);
  const [dataLoading,     setDataLoading]     = useState(true);

  const upcomingIvs: never[] = []; // No interview model in DB yet

  useEffect(() => {
    if (!isEmployer) return;

    Promise.all([
      fetch('/api/employer/jobs').then(r => r.json()),
      fetch('/api/employer/stats').then(r => r.json()),
    ]).then(([jobData, statsData]) => {
      console.log('[employer/dashboard] fetched jobs:', jobData.total, 'stats:', statsData);
      const normalised = (jobData.jobs ?? []).map((j: DbJob) => ({
        ...j,
        type:   normaliseType(j.type),
        status: normaliseStatus(j.status),
      }));
      setJobs(normalised);
      setTotalApplicants(statsData.totalApplicants ?? 0);
      setNewToday(statsData.newToday ?? 0);
    }).catch(err => console.error('[employer/dashboard] fetch error:', err))
      .finally(() => setDataLoading(false));
  }, [isEmployer]);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;

  const stats = [
    { label: 'Total Jobs Posted',      value: jobs.length,     icon: Briefcase,   bg: 'bg-purple-50', fg: 'text-purple-600' },
    { label: 'Total Applications',     value: totalApplicants, icon: Users,        bg: 'bg-blue-50',   fg: 'text-blue-600' },
    { label: 'Active Jobs',            value: activeJobs,      icon: CheckCircle,  bg: 'bg-green-50',  fg: 'text-green-600' },
    { label: 'New Applications Today', value: newToday,        icon: Users,        bg: 'bg-orange-50', fg: 'text-orange-600' },
  ];

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s your hiring at a glance.
        </p>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, bg, fg }) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${fg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent jobs */}
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Recent Job Postings</h2>
            {dataLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Briefcase className="h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm font-semibold text-gray-600">No jobs posted yet</p>
                <p className="mt-1 text-xs text-gray-400">Click &quot;+ Post a Job&quot; to get started.</p>
                <Link href="/employer/jobs/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6B46C1] px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700">
                  + Post a Job
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {jobs.slice(0, 4).map((j) => (
                  <li key={j.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">{j.title}</p>
                      <p className="text-xs text-gray-500">{j.location} · {j.type}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                      j.status === 'active' ? 'bg-green-100 text-green-700' :
                      j.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                    }`}>{j.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick links + upcoming */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Post a Job',         href: '/employer/jobs/new',  cls: 'bg-[#6B46C1] text-white hover:bg-purple-700' },
                  { label: 'View Applications',  href: '/employer/jobs',       cls: 'border border-purple-200 text-purple-700 hover:bg-purple-50' },
                  { label: 'Schedule Interview', href: '/employer/interviews', cls: 'border border-gray-200 text-gray-700 hover:bg-gray-50' },
                ].map(({ label, href, cls }) => (
                  <Link key={label} href={href}
                    className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${cls}`}>
                    {label}<ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Upcoming Interviews
              </p>
              {upcomingIvs.length === 0 ? (
                <p className="text-xs text-gray-400">No interviews scheduled yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </EmployerShell>
  );
}
