'use client';

import { useEffect, useState } from 'react';
import { RecruiterShell } from '@/components/recruiter/RecruiterShell';
import Link from 'next/link';
import { Users, Calendar, CheckCircle, XCircle, Briefcase, ArrowRight } from 'lucide-react';

interface DashboardData {
  assignedApps:    number;
  todayInterviews: number;
  passCount:       number;
  failCount:       number;
  hiredCount:      number;
  recentApps: {
    id: string; status: string; appliedAt: string;
    job:       { title: string };
    candidate: { name: string; email: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED:     'bg-blue-100 text-blue-700',
  REVIEWING:   'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  HIRED:       'bg-green-100 text-green-700',
  REJECTED:    'bg-red-100 text-red-700',
};

export default function RecruiterDashboard() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recruiter/dashboard')
      .then(r => r.json())
      .then((d: DashboardData) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data ? [
    { label: 'Assigned Candidates', value: data.assignedApps,    icon: Users,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: "Today's Interviews",  value: data.todayInterviews, icon: Calendar,     color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Pass Decisions',       value: data.passCount,       icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Candidates Hired',     value: data.hiredCount,      icon: Briefcase,    color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Fail Decisions',       value: data.failCount,       icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50'    },
  ] : [];

  return (
    <RecruiterShell>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Recruiter Overview</h1>
          <p className="mt-0.5 text-sm text-gray-500">Your hiring activity at a glance.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent assigned candidates */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recent Assigned Candidates</h2>
            <Link href="/recruiter/applications" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : !data?.recentApps.length ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">No assigned candidates yet</p>
              <p className="mt-1 text-xs text-gray-400">Go to Candidates and assign yourself to applications.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 border-b border-gray-100 px-5 py-3">
                {['CANDIDATE', 'ROLE', 'STATUS', 'APPLIED'].map(h => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
                ))}
              </div>
              {data!.recentApps.map(app => (
                <div key={app.id}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr] items-center gap-4 border-b border-gray-50 px-5 py-3.5 last:border-0 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{app.candidate.name}</p>
                    <p className="text-xs text-gray-400">{app.candidate.email}</p>
                  </div>
                  <p className="truncate text-sm text-gray-600">{app.job.title}</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { href: '/recruiter/interviews', label: 'Schedule Interview', desc: 'Set up a new candidate interview', icon: Calendar },
            { href: '/recruiter/jobs?new=1', label: 'Post a Job',         desc: 'Add a new job listing',          icon: Briefcase },
            { href: '/recruiter/pipeline',   label: 'View Pipeline',      desc: 'See full hiring funnel',         icon: Users },
          ].map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </RecruiterShell>
  );
}
