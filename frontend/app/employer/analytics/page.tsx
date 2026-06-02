'use client';

import { EmployerShell } from '@/components/employer/EmployerShell';
import { useEmployerStore } from '@/store/employerStore';

const STATUS_COLORS: Record<string, string> = {
  new: '#6B46C1',
  reviewed: '#94A3B8',
  shortlisted: '#3B82F6',
  interview_scheduled: '#F59E0B',
  hired: '#10B981',
  rejected: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function AnalyticsPage() {
  const { jobs, candidates } = useEmployerStore();

  // Applications per job
  const jobStats = jobs.map((j) => ({
    title: j.title,
    count: candidates.filter((c) => c.jobId === j.id).length,
    shortlisted: candidates.filter((c) => c.jobId === j.id && c.status === 'shortlisted').length,
    views: j.views,
  }));
  const maxApps = Math.max(...jobStats.map((j) => j.count), 1);

  // Status breakdown
  const statusBreakdown = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    count: candidates.filter((c) => c.status === status).length,
  })).filter((s) => s.count > 0);
  const totalCandidates = candidates.length || 1;

  // Donut segments (conic-gradient)
  let accumulated = 0;
  const segments = statusBreakdown.map((s) => {
    const pct = (s.count / totalCandidates) * 100;
    const from = accumulated;
    accumulated += pct;
    return { ...s, from, to: accumulated, pct };
  });

  const conicGradient = segments
    .map((s) => `${STATUS_COLORS[s.status] ?? '#94A3B8'} ${s.from}% ${s.to}%`)
    .join(', ');

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Hiring funnel overview for your active listings.</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar chart — Applications per job */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-semibold text-gray-900">Applications per Job</h2>
            <div className="space-y-4">
              {jobStats.map(({ title, count }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="w-36 truncate text-xs font-medium text-gray-600" title={title}>{title}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-5">
                    <div
                      className="h-full rounded-full bg-[#6B46C1] transition-all duration-500"
                      style={{ width: `${(count / maxApps) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart — Status breakdown */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-semibold text-gray-900">Status Breakdown</h2>
            <div className="flex items-center gap-8">
              {/* Donut */}
              <div className="relative flex-none">
                <div
                  className="h-40 w-40 rounded-full"
                  style={{ background: `conic-gradient(${conicGradient || '#6B46C1 0% 100%'})` }}
                />
                <div className="absolute inset-[20px] rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-gray-900">{candidates.length}</p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-2">
                {segments.map((s) => (
                  <div key={s.status} className="flex items-center gap-2 text-xs">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] ?? '#94A3B8' }} />
                    <span className="text-gray-600">{STATUS_LABELS[s.status]}</span>
                    <span className="ml-auto font-bold text-gray-900">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                {['Job Title', 'Views', 'Applications', 'Shortlisted', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobStats.map((row, i) => {
                const job = jobs[i];
                return (
                  <tr key={row.title} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.title}</td>
                    <td className="px-6 py-4 text-gray-600">{row.views}</td>
                    <td className="px-6 py-4 text-gray-600">{row.count}</td>
                    <td className="px-6 py-4 text-gray-600">{row.shortlisted}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </EmployerShell>
  );
}
