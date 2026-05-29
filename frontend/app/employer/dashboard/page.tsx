'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  PlusCircle,
  ClipboardList,
  BarChart3,
  Settings,
  LayoutDashboard,
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

// ─── Employer nav sections ────────────────────────────────────────────────────

const EMPLOYER_NAV: SidebarNavSection[] = [
  {
    label: 'Manage',
    items: [
      { href: '/employer/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/employer/dashboard/listings', label: 'My Listings', icon: Layers },
      { href: '/employer/dashboard/applications', label: 'Applications Received', icon: ClipboardList },
      { href: '/employer/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/employer/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ─── Sample data ──────────────────────────────────────────────────────────────

type KPIItem = { icon: React.ReactNode; label: string; value: number; change: string };

const KPI_DATA: KPIItem[] = [
  { icon: <Layers className="h-5 w-5" />, label: 'Active Listings', value: 8, change: '+2 this week' },
  { icon: <Users className="h-5 w-5" />, label: 'Total Applicants', value: 47, change: '+12 this week' },
  { icon: <Calendar className="h-5 w-5" />, label: 'Interviews Scheduled', value: 6, change: '+3 this week' },
  { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Jobs Filled', value: 3, change: '+1 this month' },
];

type ListingStatus = 'Active' | 'Paused' | 'Closed';

type JobListing = {
  id: string;
  title: string;
  location: string;
  applications: number;
  status: ListingStatus;
  posted: string;
};

const JOB_LISTINGS: JobListing[] = [
  { id: '1', title: 'Senior React Developer', location: 'Bangalore', applications: 12, status: 'Active', posted: 'May 20' },
  { id: '2', title: 'Backend Engineer', location: 'Remote', applications: 8, status: 'Active', posted: 'May 18' },
  { id: '3', title: 'Product Manager', location: 'Mumbai', applications: 3, status: 'Paused', posted: 'May 15' },
  { id: '4', title: 'UI/UX Designer', location: 'Pune', applications: 0, status: 'Closed', posted: 'May 10' },
];

type ApplicantRow = {
  id: string;
  candidateName: string;
  jobTitle: string;
  stage: ApplicationStatus;
  appliedDate: string;
  initial: string;
  color: string;
};

const APPLICANTS: ApplicantRow[] = [
  { id: '1', candidateName: 'Priya Sharma', jobTitle: 'Senior React Developer', stage: 'Shortlisted', appliedDate: 'May 22', initial: 'P', color: 'bg-pink-500' },
  { id: '2', candidateName: 'Rahul Mehta', jobTitle: 'Backend Engineer', stage: 'Interview', appliedDate: 'May 21', initial: 'R', color: 'bg-blue-500' },
  { id: '3', candidateName: 'Ananya Singh', jobTitle: 'Senior React Developer', stage: 'Applied', appliedDate: 'May 20', initial: 'A', color: 'bg-violet-500' },
  { id: '4', candidateName: 'Vikram Nair', jobTitle: 'Product Manager', stage: 'Applied', appliedDate: 'May 19', initial: 'V', color: 'bg-green-600' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  Active: 'bg-green-50 text-green-700',
  Paused: 'bg-yellow-50 text-yellow-700',
  Closed: 'bg-gray-100 text-gray-500',
};

function ListingStatusChip({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        LISTING_STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}

function ActionBtn({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'warning';
}) {
  return (
    <button
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
        variant === 'warning'
          ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
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

export default function EmployerDashboardPage() {
  const router = useRouter();

  // Initializes Supabase auth listener + populates store
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? 'CANDIDATE').toUpperCase();

  // Client-side guard — middleware handles server-side, this is belt-and-suspenders
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole !== 'EMPLOYER') router.replace('/dashboard');
    }
  }, [user, isLoading, userRole, router]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';

  const initials =
    displayName
      .split(' ')
      .map((w) => w[0] ?? '')
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

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
        role="Employer"
        onLogout={handleLogout}
        primaryButtonLabel="Post a Job"
        primaryButtonIcon={PlusCircle}
        onPrimaryButton={() => router.push('/employer/dashboard/post-job')}
        navSections={EMPLOYER_NAV}
      />

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">

        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidates, listings..."
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
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your listings today.
          </p>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {KPI_DATA.map(({ icon, label, value, change }) => (
              <KPICard key={label} icon={icon} label={label} value={value} change={change} />
            ))}
          </div>

          {/* My Job Listings */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">My Job Listings</h2>
              <Link
                href="/employer/dashboard/listings"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['JOB TITLE', 'APPLICATIONS', 'STATUS', 'POSTED', 'ACTIONS'] as const).map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {JOB_LISTINGS.map(({ id, title, location, applications, status, posted }) => (
              <div
                key={id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                  <p className="truncate text-xs text-muted-foreground">{location}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{applications}</p>
                <ListingStatusChip status={status} />
                <p className="text-sm text-muted-foreground">{posted}</p>
                <div className="flex items-center gap-1.5">
                  <ActionBtn>View</ActionBtn>
                  <ActionBtn>Edit</ActionBtn>
                  <ActionBtn variant={status === 'Active' ? 'warning' : 'default'}>
                    {status === 'Active' ? 'Pause' : status === 'Paused' ? 'Resume' : 'Repost'}
                  </ActionBtn>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Applicants */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Applicants</h2>
              <Link
                href="/employer/dashboard/applications"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-gray-100 px-6 py-3">
              {(['CANDIDATE', 'JOB APPLIED FOR', 'STAGE', 'APPLIED', 'ACTIONS'] as const).map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {APPLICANTS.map(({ id, candidateName, jobTitle, stage, appliedDate, initial, color }) => (
              <div
                key={id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50"
              >
                {/* CANDIDATE */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}
                  >
                    {initial}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{candidateName}</p>
                </div>

                {/* JOB */}
                <p className="truncate text-sm text-muted-foreground">{jobTitle}</p>

                {/* STAGE */}
                <StatusChip status={stage} />

                {/* APPLIED */}
                <p className="text-sm text-muted-foreground">{appliedDate}</p>

                {/* ACTIONS */}
                <div className="flex items-center gap-1.5">
                  <ActionBtn>View Profile</ActionBtn>
                  <ActionBtn>Schedule Interview</ActionBtn>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
