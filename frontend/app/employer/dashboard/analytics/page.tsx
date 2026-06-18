'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3, Users, CheckCircle2, XCircle,
  TrendingUp, Layers, PlusCircle, ClipboardList,
  LayoutDashboard, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';

const EMPLOYER_NAV: SidebarNavSection[] = [
  {
    label: 'Manage',
    items: [
      { href: '/employer/dashboard',             label: 'Overview',              icon: LayoutDashboard },
      { href: '/employer/dashboard/listings',    label: 'My Listings',           icon: Layers },
      { href: '/employer/dashboard/applications',label: 'Applications Received', icon: ClipboardList },
      { href: '/employer/dashboard/analytics',   label: 'Analytics',             icon: BarChart3 },
      { href: '/employer/offer-letter',          label: 'Offer Letter',          icon: FileText },
    ],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analytics {
  summary: {
    total: number;
    byStatus: Record<string, number>;
  };
  topJobs: { id: string; title: string; count: number }[];
  timeline: { date: string; count: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:     { label: 'Applied',     color: 'bg-gray-400',   bg: 'bg-gray-50 text-gray-600' },
  REVIEWING:   { label: 'Reviewing',   color: 'bg-sky-500',    bg: 'bg-sky-50 text-sky-700' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-yellow-500', bg: 'bg-yellow-50 text-yellow-700' },
  REJECTED:    { label: 'Rejected',    color: 'bg-red-400',    bg: 'bg-red-50 text-red-600' },
  HIRED:       { label: 'Hired',       color: 'bg-emerald-500',bg: 'bg-emerald-50 text-emerald-700' },
};

function pct(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

// ─── Analytics content (needs Suspense for useSearchParams) ──────────────────

function AnalyticsContent() {
  const router = useRouter();
  useSearchParams(); // keeps router context stable
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();
  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (!isLoading && user && userRole !== 'EMPLOYER') router.replace('/dashboard');
  }, [user, isLoading, userRole, router]);

  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/employer/analytics')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser(); router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const total = data?.summary.total ?? 0;
  const byStatus = data?.summary.byStatus ?? {};
  const topJobs  = data?.topJobs ?? [];
  const timeline = data?.timeline ?? [];
  const maxCount = Math.max(...timeline.map(t => t.count), 1);

  const conversionRate = total > 0
    ? pct(byStatus['HIRED'] ?? 0, total)
    : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        displayName={displayName} role="Employer" onLogout={handleLogout}
        primaryButtonLabel="Post a Job" primaryButtonIcon={PlusCircle}
        onPrimaryButton={() => router.push('/employer/dashboard/post-job')}
        navSections={EMPLOYER_NAV}
      />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-6">
          <BarChart3 className="h-5 w-5 text-primary mr-2" />
          <h1 className="font-semibold text-foreground">Analytics</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* ── KPI row ── */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Total Applications', value: total, Icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Shortlisted',         value: byStatus['SHORTLISTED'] ?? 0, Icon: CheckCircle2, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { label: 'Hired',               value: byStatus['HIRED'] ?? 0,       Icon: TrendingUp,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Conversion Rate',     value: `${conversionRate}%`,          Icon: XCircle,      color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map(({ label, value, Icon, color, bg }) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{label}</p>
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
                        <Icon className={cn('h-4 w-4', color)} />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* ── Status Breakdown ── */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground mb-5">Application Status Breakdown</h2>

                {total === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications received yet.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const count = byStatus[key] ?? 0;
                      const percent = pct(count, total);
                      return (
                        <div key={key}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', cfg.bg)}>
                              {cfg.label}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {count} <span className="text-xs font-normal text-muted-foreground">({percent}%)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', cfg.color)}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Timeline + Top Jobs ── */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Applications over 14 days — CSS bar chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-foreground mb-5">Applications — Last 14 Days</h2>

                  {timeline.every(t => t.count === 0) ? (
                    <p className="text-sm text-muted-foreground">No applications in this period.</p>
                  ) : (
                    <div className="flex items-end gap-1.5 h-36">
                      {timeline.map(({ date, count }) => (
                        <div key={date} className="flex flex-1 flex-col items-center gap-1 group">
                          {/* Bar */}
                          <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                            <div
                              className="w-full max-w-[24px] rounded-t-md bg-primary/80 group-hover:bg-primary transition-colors"
                              style={{ height: `${Math.max(4, (count / maxCount) * 100)}px` }}
                            />
                            {/* Tooltip on hover */}
                            {count > 0 && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                {count}
                              </span>
                            )}
                          </div>
                          {/* Date label — show every other one to avoid crowding */}
                          <span className="text-[8px] text-muted-foreground text-center leading-tight w-full truncate">
                            {date}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top performing jobs */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-foreground mb-5">Top Performing Listings</h2>

                  {topJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topJobs.map((job, i) => {
                        const topCount = topJobs[0].count || 1;
                        const barWidth = pct(job.count, topCount);
                        return (
                          <div key={job.id}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                  {i + 1}
                                </span>
                                <p className="truncate text-sm font-medium text-foreground">{job.title}</p>
                              </div>
                              <span className="shrink-0 text-sm font-semibold text-foreground">
                                {job.count}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-primary/60 transition-all duration-500"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Empty state CTA ── */}
              {total === 0 && topJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-16 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 font-medium text-foreground">No data yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Post jobs and receive applications to see analytics here.
                  </p>
                  <button
                    onClick={() => router.push('/employer/dashboard/post-job')}
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" /> Post a Job
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

const SPINNER = (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export default function AnalyticsPage() {
  return <Suspense fallback={SPINNER}><AnalyticsContent /></Suspense>;
}
