'use client';

import { useState, useEffect } from 'react';
import { EmployerShell } from '@/components/employer/EmployerShell';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  summary: { total: number; byStatus: Record<string, number> };
  topJobs: { id: string; title: string; status: string; count: number; shortlisted: number; views: number }[];
  timeline: { date: string; count: number }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  APPLIED:     '#6B46C1',
  REVIEWING:   '#94A3B8',
  SHORTLISTED: '#3B82F6',
  HIRED:       '#10B981',
  REJECTED:    '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED:     'Applied',
  REVIEWING:   'Reviewing',
  SHORTLISTED: 'Shortlisted',
  HIRED:       'Hired',
  REJECTED:    'Rejected',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employer/analytics')
      .then(r => r.ok ? r.json() : null)
      .then((d: AnalyticsData | null) => setData(d))
      .catch(err => console.error('[analytics]', err))
      .finally(() => setLoading(false));
  }, []);

  const maxApps = Math.max(...(data?.topJobs.map(j => j.count) ?? [0]), 1);
  const maxViews = Math.max(...(data?.topJobs.map(j => j.views) ?? [0]), 1);
  const maxTimeline = Math.max(...(data?.timeline.map(d => d.count) ?? [0]), 1);

  const totalApps = data?.summary.total ?? 0;

  // Donut chart
  const statusBreakdown = Object.entries(data?.summary.byStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ status, count }));

  let accumulated = 0;
  const segments = statusBreakdown.map(({ status, count }) => {
    const pct  = (count / (totalApps || 1)) * 100;
    const from = accumulated;
    accumulated += pct;
    return { status, count, from, to: accumulated, pct };
  });

  const conicGradient = segments
    .map(s => `${STATUS_COLORS[s.status] ?? '#94A3B8'} ${s.from.toFixed(1)}% ${s.to.toFixed(1)}%`)
    .join(', ');

  return (
    <EmployerShell>
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Hiring funnel overview — live data from your listings.</p>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
          </div>
        ) : !data ? (
          <p className="mt-12 text-center text-sm text-gray-400">Could not load analytics.</p>
        ) : (
          <>
            {/* KPI row */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Applications', value: totalApps },
                { label: 'Shortlisted',        value: data.summary.byStatus['SHORTLISTED'] ?? 0 },
                { label: 'Hired',              value: data.summary.byStatus['HIRED'] ?? 0 },
                { label: 'Total Job Views',    value: data.topJobs.reduce((s, j) => s + j.views, 0) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Bar chart — applications per job */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">Applications per Job</h2>
                {data.topJobs.length === 0 ? (
                  <p className="text-sm text-gray-400">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.topJobs.map(({ title, count }) => (
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
                )}
              </div>

              {/* Donut — status breakdown */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-semibold text-gray-900">Status Breakdown</h2>
                <div className="flex items-center gap-8">
                  <div className="relative flex-none">
                    <div
                      className="h-40 w-40 rounded-full"
                      style={{ background: `conic-gradient(${conicGradient || '#6B46C1 0% 100%'})` }}
                    />
                    <div className="absolute inset-[20px] rounded-full bg-white flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-extrabold text-gray-900">{totalApps}</p>
                        <p className="text-[10px] text-gray-400">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {segments.map(s => (
                      <div key={s.status} className="flex items-center gap-2 text-xs">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] ?? '#94A3B8' }} />
                        <span className="text-gray-600">{STATUS_LABELS[s.status] ?? s.status}</span>
                        <span className="ml-2 font-bold text-gray-900">{s.count}</span>
                      </div>
                    ))}
                    {segments.length === 0 && <p className="text-xs text-gray-400">No applications yet.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 14-day timeline */}
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-semibold text-gray-900">Applications — Last 14 Days</h2>
              <div className="flex items-end gap-1 h-24">
                {data.timeline.map(({ date, count }) => (
                  <div key={date} className="group relative flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-sm bg-[#6B46C1]/80 transition-all duration-300 hover:bg-[#6B46C1]"
                      style={{ height: `${(count / maxTimeline) * 96}px`, minHeight: count > 0 ? '4px' : '0' }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden rounded bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap z-10">
                      {date}: {count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                <span>{data.timeline[0]?.date}</span>
                <span>{data.timeline[data.timeline.length - 1]?.date}</span>
              </div>
            </div>

            {/* Job performance table */}
            <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    {['Job Title', 'Status', 'Views', 'Applications', 'Shortlisted / Hired'].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                        No jobs found. Post a job to see analytics.
                      </td>
                    </tr>
                  ) : data.topJobs.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{row.title}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${(row.views / maxViews) * 100}%` }} />
                          </div>
                          <span>{row.views}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.count}</td>
                      <td className="px-6 py-4 text-gray-600">{row.shortlisted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </EmployerShell>
  );
}
