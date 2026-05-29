'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  Users,
  Briefcase,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  FileBarChart,
  Settings,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { KPICard } from '@/components/ui/KPICard';
import { StatusChip, type ApplicationStatus } from '@/components/ui/StatusChip';
import {
  DashboardSidebar,
  type SidebarNavSection,
} from '@/components/dashboard/DashboardSidebar';

// ─── Admin nav ────────────────────────────────────────────────────────────────

const ADMIN_NAV: SidebarNavSection[] = [
  {
    label: 'Platform',
    items: [
      { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/admin/users', label: 'Users', icon: Users },
      { href: '/dashboard/admin/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/dashboard/admin/applications', label: 'Applications', icon: ClipboardList },
      { href: '/dashboard/admin/reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ─── Sample data ──────────────────────────────────────────────────────────────

type KPIItem = { icon: React.ReactNode; label: string; value: string | number; change: string };

const KPI_DATA: KPIItem[] = [
  { icon: <Users className="h-5 w-5" />, label: 'Total Users', value: '1,284', change: '+48 this week' },
  { icon: <Briefcase className="h-5 w-5" />, label: 'Jobs Posted', value: '3,920', change: '+124 this week' },
  { icon: <ClipboardList className="h-5 w-5" />, label: 'Applications', value: '18,640', change: '+892 this week' },
  { icon: <TrendingUp className="h-5 w-5" />, label: 'Active Today', value: 247, change: '+31 vs yesterday' },
];

type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
type UserStatus = 'Active' | 'Suspended';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joined: string;
  status: UserStatus;
  initial: string;
  color: string;
};

const RECENT_USERS: UserRow[] = [
  { id: '1', name: 'Priya Sharma',    email: 'priya@example.com',   role: 'CANDIDATE', joined: 'May 22', status: 'Active',    initial: 'P', color: 'bg-pink-500' },
  { id: '2', name: 'Rahul Mehta',     email: 'rahul@techcorp.in',   role: 'EMPLOYER',  joined: 'May 21', status: 'Active',    initial: 'R', color: 'bg-blue-500' },
  { id: '3', name: 'Ananya Singh',    email: 'ananya@example.com',  role: 'CANDIDATE', joined: 'May 20', status: 'Suspended', initial: 'A', color: 'bg-violet-500' },
  { id: '4', name: 'TechCorp India',  email: 'hr@techcorp.in',      role: 'EMPLOYER',  joined: 'May 19', status: 'Active',    initial: 'T', color: 'bg-orange-500' },
];

type JobStatus = 'Active' | 'Pending' | 'Closed';

type JobRow = {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  posted: string;
  applications: number;
  initial: string;
  color: string;
};

const RECENT_JOBS: JobRow[] = [
  { id: '1', title: 'Senior React Developer', company: 'TechCorp India',  status: 'Active',  posted: 'May 20', applications: 12, initial: 'T', color: 'bg-blue-500' },
  { id: '2', title: 'Backend Engineer',        company: 'StartupXYZ',      status: 'Pending', posted: 'May 18', applications: 3,  initial: 'S', color: 'bg-violet-500' },
  { id: '3', title: 'Product Manager',         company: 'BigCorp Ltd',     status: 'Active',  posted: 'May 15', applications: 8,  initial: 'B', color: 'bg-orange-500' },
  { id: '4', title: 'UI/UX Designer',          company: 'Digital Agency',  status: 'Closed',  posted: 'May 10', applications: 0,  initial: 'D', color: 'bg-green-600' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USER_STATUS_STYLES: Record<UserStatus, string> = {
  Active:    'bg-green-50 text-green-700',
  Suspended: 'bg-red-50 text-red-600',
};

const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  Active:  'bg-green-50 text-green-700',
  Pending: 'bg-yellow-50 text-yellow-700',
  Closed:  'bg-gray-100 text-gray-500',
};

const ROLE_STYLES: Record<UserRole, string> = {
  CANDIDATE: 'bg-blue-50 text-blue-700',
  EMPLOYER:  'bg-violet-50 text-violet-700',
  ADMIN:     'bg-primary/10 text-primary',
};

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}

function ActionBtn({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
}) {
  return (
    <button
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        variant === 'danger'
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : variant === 'success'
          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          : 'border-gray-200 bg-white text-muted-foreground hover:bg-gray-50 hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? 'CANDIDATE').toUpperCase();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole !== 'ADMIN') router.replace('/dashboard');
    }
  }, [user, isLoading, userRole, router]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'Admin';

  const initials =
    displayName
      .split(' ')
      .map((w) => w[0] ?? '')
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A';

  const greeting = useMemo(getGreeting, []);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <DashboardSidebar
        displayName={displayName}
        role="Admin"
        onLogout={handleLogout}
        primaryButtonLabel="Add User"
        primaryButtonIcon={UserPlus}
        onPrimaryButton={() => router.push('/dashboard/admin/users/new')}
        navSections={ADMIN_NAV}
      />

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">

        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users, jobs, companies..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button
              aria-label="Language"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
            </button>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Greeting */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                Platform overview — all systems operational.
              </p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {KPI_DATA.map(({ icon, label, value, change }) => (
              <KPICard key={label} icon={icon} label={label} value={value} change={change} />
            ))}
          </div>

          {/* Recent Users */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Users</h2>
              <Link href="/dashboard/admin/users" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['USER', 'EMAIL', 'ROLE', 'JOINED', 'STATUS', 'ACTIONS'] as const).map((col) => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {RECENT_USERS.map(({ id, name, email, role, joined, status, initial, color }) => (
              <div
                key={id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50"
              >
                {/* USER */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
                    {initial}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                </div>

                {/* EMAIL */}
                <p className="truncate text-sm text-muted-foreground">{email}</p>

                {/* ROLE */}
                <Chip label={role} className={ROLE_STYLES[role]} />

                {/* JOINED */}
                <p className="text-sm text-muted-foreground">{joined}</p>

                {/* STATUS */}
                <Chip label={status} className={USER_STATUS_STYLES[status]} />

                {/* ACTIONS */}
                <div className="flex items-center gap-1.5">
                  <ActionBtn>View</ActionBtn>
                  <ActionBtn variant={status === 'Active' ? 'danger' : 'success'}>
                    {status === 'Active' ? 'Suspend' : 'Restore'}
                  </ActionBtn>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Jobs */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Jobs</h2>
              <Link href="/dashboard/admin/jobs" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['JOB TITLE', 'COMPANY', 'APPS', 'STATUS', 'POSTED', 'ACTIONS'] as const).map((col) => (
                <span key={col} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {RECENT_JOBS.map(({ id, title, company, status, posted, applications, initial, color }) => (
              <div
                key={id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50"
              >
                {/* JOB */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${color}`}>
                    {initial}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                </div>

                {/* COMPANY */}
                <p className="truncate text-sm text-muted-foreground">{company}</p>

                {/* APPS */}
                <p className="text-sm font-medium text-foreground">{applications}</p>

                {/* STATUS */}
                <Chip label={status} className={JOB_STATUS_STYLES[status]} />

                {/* POSTED */}
                <p className="text-sm text-muted-foreground">{posted}</p>

                {/* ACTIONS */}
                <div className="flex items-center gap-1.5">
                  <ActionBtn>View</ActionBtn>
                  {status === 'Pending' && <ActionBtn variant="success">Approve</ActionBtn>}
                  {status === 'Active'  && <ActionBtn variant="danger">Remove</ActionBtn>}
                  {status === 'Closed'  && <ActionBtn>Reopen</ActionBtn>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
