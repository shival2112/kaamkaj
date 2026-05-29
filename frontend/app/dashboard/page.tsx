'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  Send,
  Calendar,
  Eye,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { KPICard } from '@/components/ui/KPICard';
import { StatusChip, type ApplicationStatus } from '@/components/ui/StatusChip';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

// ─── Static sample data ───────────────────────────────────────────────────────

type KPIItem = { icon: React.ReactNode; label: string; value: number; change: string };

const KPI_DATA: KPIItem[] = [
  { icon: <Send className="h-5 w-5" />, label: 'Applications Sent', value: 24, change: '+4 this week' },
  { icon: <Calendar className="h-5 w-5" />, label: 'Interviews Scheduled', value: 3, change: '+1 this week' },
  { icon: <Eye className="h-5 w-5" />, label: 'Profile Views', value: 142, change: '+18 this week' },
  { icon: <Bookmark className="h-5 w-5" />, label: 'Saved Jobs', value: 12, change: '+2 this week' },
];

type ApplicationRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  stage: ApplicationStatus;
  nextStep: string;
  appliedDate: string;
  initial: string;
  color: string;
};

const APPLICATIONS: ApplicationRow[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'TechCorp India',
    location: 'Bangalore',
    stage: 'Interview',
    nextStep: 'Interview on Jun 5',
    appliedDate: 'May 22',
    initial: 'T',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    stage: 'Shortlisted',
    nextStep: 'HR call scheduled',
    appliedDate: 'May 19',
    initial: 'S',
    color: 'bg-violet-500',
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'BigCorp Ltd',
    location: 'Mumbai',
    stage: 'Applied',
    nextStep: 'Under review',
    appliedDate: 'May 18',
    initial: 'B',
    color: 'bg-orange-500',
  },
  {
    id: '4',
    title: 'React Developer',
    company: 'Digital Agency',
    location: 'Pune',
    stage: 'Offered',
    nextStep: 'Offer letter shared',
    appliedDate: 'May 15',
    initial: 'D',
    color: 'bg-green-600',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function CircularProgress({ percent }: { percent: number }) {
  // r=15.9 → circumference ≈ 100. -rotate-90 starts arc at 12 o'clock.
  return (
    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle
        cx="18" cy="18" r="15.9"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2.5"
      />
      <circle
        cx="18" cy="18" r="15.9"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${percent} ${100 - percent}`}
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  // Initialize Supabase auth listener + populate store.
  // Called here so the sidebar doesn't need a second subscription.
  const { user, dbUser, isLoading } = useAuth();

  const clearUser = useAuthStore((s) => s.clearUser);

  const userRole = ((user?.user_metadata?.role as string) ?? 'CANDIDATE').toUpperCase();

  // Client-side guard — role must be CANDIDATE (middleware handles server-side)
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/login');
      else if (userRole === 'EMPLOYER') router.replace('/employer/dashboard');
      else if (userRole === 'ADMIN') router.replace('/dashboard/admin');
    }
  }, [user, isLoading, userRole, router]);

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'there';
  const role = dbUser?.role ?? 'CANDIDATE';

  const initials = displayName
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

  // Show spinner while session initialises
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left sidebar ── */}
      <DashboardSidebar
        displayName={displayName}
        role={role}
        onLogout={handleLogout}
      />

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">

        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
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
            You have 3 new application updates since your last visit.
          </p>

          {/* Profile completion banner */}
          <div className="mt-6 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center">
                <CircularProgress percent={78} />
                <span className="absolute text-sm font-bold text-white">78%</span>
              </div>
              <div>
                <p className="font-semibold text-white">Complete your profile</p>
                <p className="mt-0.5 text-sm text-violet-200">
                  A complete profile gets 3× more recruiter views
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="shrink-0 rounded-lg border-2 border-white/40 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Complete profile
            </Link>
          </div>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {KPI_DATA.map(({ icon, label, value, change }) => (
              <KPICard key={label} icon={icon} label={label} value={value} change={change} />
            ))}
          </div>

          {/* Recent Applications */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-foreground">Recent Applications</h2>
              <Link
                href="/dashboard/applications"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-4 border-b border-gray-100 px-6 py-3">
              {(['JOB', 'STAGE', 'NEXT STEP', 'APPLIED'] as const).map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {APPLICATIONS.map(({ id, title, company, location, stage, nextStep, appliedDate, initial, color }) => (
              <div
                key={id}
                className="grid grid-cols-4 items-center border-b border-gray-50 px-6 py-4 last:border-0 transition-colors hover:bg-gray-50"
              >
                {/* JOB */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {company} · {location}
                    </p>
                  </div>
                </div>

                {/* STAGE */}
                <StatusChip status={stage} />

                {/* NEXT STEP */}
                <p className="text-sm text-muted-foreground">{nextStep}</p>

                {/* APPLIED */}
                <p className="text-sm text-muted-foreground">{appliedDate}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
