'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileBarChart, Users, Briefcase, ClipboardList,
  TrendingUp, LayoutDashboard, CheckCircle2, XCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { DashboardSidebar, type SidebarNavSection } from '@/components/dashboard/DashboardSidebar';

const ADMIN_NAV: SidebarNavSection[] = [
  {
    label: 'Platform',
    items: [
      { href: '/dashboard/admin',         label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/admin/users',   label: 'Users',    icon: Users },
      { href: '/dashboard/admin/jobs',    label: 'Jobs',     icon: Briefcase },
      { href: '/dashboard/admin/reports', label: 'Reports',  icon: FileBarChart },
    ],
  },
];

interface Stats {
  totalUsers: number; totalJobs: number; activeJobs: number;
  totalApplications: number; newUsersToday: number;
}

interface MetricCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function MetricCard({ label, value, sub, icon, iconBg, iconColor }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();
  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
    if (!isLoading && user && userRole !== 'ADMIN') router.replace('/dashboard');
  }, [user, isLoading, userRole, router]);

  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'Admin';
  const handleLogout = async () => {
    await createSupabaseClient().auth.signOut();
    clearUser(); router.push('/');
  };

  if (isLoading || !user) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  const closedJobs = stats ? stats.totalJobs - stats.activeJobs : 0;
  const fillRate   = stats?.totalJobs ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0;
  const avgAppsPerJob = stats?.totalJobs ? (stats.totalApplications / stats.totalJobs).toFixed(1) : '—';

  const generatedAt = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar displayName={displayName} role="Admin" onLogout={handleLogout}
        primaryButtonLabel="Overview" primaryButtonIcon={LayoutDashboard}
        onPrimaryButton={() => router.push('/dashboard/admin')}
        navSections={ADMIN_NAV} />

      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Platform Report</h1>
          </div>
          <p className="text-xs text-muted-foreground">Generated: {generatedAt}</p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Section: Users */}
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Users
                </h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <MetricCard label="Total Registered Users" value={stats?.totalUsers ?? 0}
                    sub="All roles combined" icon={<Users className="h-5 w-5" />}
                    iconBg="bg-blue-50" iconColor="text-blue-600" />
                  <MetricCard label="New Users Today" value={stats?.newUsersToday ?? 0}
                    sub="Registered in last 24 h" icon={<TrendingUp className="h-5 w-5" />}
                    iconBg="bg-green-50" iconColor="text-green-600" />
                </div>
              </section>

              {/* Section: Jobs */}
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Jobs
                </h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <MetricCard label="Total Jobs Posted" value={stats?.totalJobs ?? 0}
                    icon={<Briefcase className="h-5 w-5" />}
                    iconBg="bg-violet-50" iconColor="text-violet-600" />
                  <MetricCard label="Active Listings" value={stats?.activeJobs ?? 0}
                    sub={`${fillRate}% of all jobs`} icon={<CheckCircle2 className="h-5 w-5" />}
                    iconBg="bg-green-50" iconColor="text-green-600" />
                  <MetricCard label="Closed / Expired" value={closedJobs}
                    icon={<XCircle className="h-5 w-5" />}
                    iconBg="bg-gray-50" iconColor="text-gray-500" />
                </div>
              </section>

              {/* Section: Applications */}
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Applications
                </h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <MetricCard label="Total Applications" value={stats?.totalApplications ?? 0}
                    icon={<ClipboardList className="h-5 w-5" />}
                    iconBg="bg-orange-50" iconColor="text-orange-600" />
                  <MetricCard label="Avg. Applications / Job" value={avgAppsPerJob}
                    sub="Across all listings" icon={<TrendingUp className="h-5 w-5" />}
                    iconBg="bg-blue-50" iconColor="text-blue-600" />
                </div>
              </section>

              {/* Summary table */}
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Metric</th>
                        <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Total registered users',  stats?.totalUsers ?? 0],
                        ['New users today',          stats?.newUsersToday ?? 0],
                        ['Total jobs posted',        stats?.totalJobs ?? 0],
                        ['Active job listings',      stats?.activeJobs ?? 0],
                        ['Closed / expired jobs',    closedJobs],
                        ['Active listing rate',      `${fillRate}%`],
                        ['Total applications',       stats?.totalApplications ?? 0],
                        ['Avg applications per job', avgAppsPerJob],
                      ].map(([label, value], i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5 text-sm text-foreground">{label}</td>
                          <td className="px-6 py-3.5 text-right font-semibold text-foreground">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
