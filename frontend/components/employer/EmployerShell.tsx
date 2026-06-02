'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Star,
  Columns2,
  Calendar,
  BarChart3,
  Building,
  LogOut,
  Menu,
  Plus,
  Globe,
  Bell,
} from 'lucide-react';
import { useEmployerStore } from '@/store/employerStore';
import { useAppAuth } from '@/context/AppAuthContext';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { href: '/employer/dashboard',    label: 'Overview',               icon: LayoutDashboard },
  { href: '/employer/jobs',         label: 'My Listings',            icon: Briefcase },
  { href: '/employer/applications', label: 'Applications Received',  icon: Users },
  { href: '/employer/shortlisted',  label: 'Shortlisted',            icon: Star },
  { href: '/employer/pipeline',     label: 'Hiring Pipeline',        icon: Columns2 },
  { href: '/employer/interviews',   label: 'Interviews',             icon: Calendar },
  { href: '/employer/analytics',    label: 'Analytics',              icon: BarChart3 },
  { href: '/employer/profile',      label: 'Company Profile',        icon: Building },
];

function SidebarContent({
  onLinkClick,
}: {
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { employer } = useEmployerStore();
  const { activeUser, hydrated, logout: appLogout } = useAppAuth();
  const { data: nextSession } = useSession();
  const { user: supabaseUser, dbUser } = useAuth();

  // Redirect only when no session exists across all three auth mechanisms
  useEffect(() => {
    if (hydrated && !activeUser && !nextSession && !supabaseUser) {
      document.cookie = 'demo-employer=; path=/; max-age=0';
      router.replace('/');
    }
  }, [hydrated, activeUser, nextSession, supabaseUser, router]);

  // Priority: NextAuth > Supabase DB name > AppAuthContext > store fallback
  const supabaseName = dbUser?.name ?? (supabaseUser?.user_metadata?.name as string | undefined);
  const displayName =
    nextSession?.user?.companyName
    || (activeUser?.type === 'employer' ? activeUser.employer.name : null)
    || supabaseName
    || employer.name
    || 'My Company';

  const displayInitials =
    nextSession?.user?.companyName
      ? nextSession.user.companyName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : activeUser?.type === 'employer'
      ? (activeUser.employer.initials || activeUser.name.slice(0, 2).toUpperCase())
    : supabaseName
      ? supabaseName.split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : (employer.initials || 'EM');

  const handleLogout = async () => {
    appLogout(); // clears AppAuthContext + demo cookies
    // Also sign out of Supabase in case user has a real session
    try { await createSupabaseClient().auth.signOut(); } catch { /* ignore */ }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-[#6B46C1] text-white">
      {/* Company header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold">
            {displayInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{displayName}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-purple-300">
              Employer
            </p>
          </div>
        </div>

        <Link
          href="/employer/jobs/new"
          onClick={onLinkClick}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/30"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (label !== 'Applications Received' &&
              label !== 'Overview' &&
              pathname.startsWith(href));
          return (
            <Link
              key={label}
              href={href}
              onClick={onLinkClick}
              className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/20 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────

const STORAGE_KEY = 'kk_employer_read_notifs';

interface Notification {
  id: string;
  candidateName: string;
  jobTitle: string;
  appliedAt: string;
  status: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function readIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]); }
  catch { return new Set(); }
}
function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids))); } catch { /* ignore */ }
}

function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds_,      setReadIds_]      = useState<Set<string>>(new Set());
  const [loading,       setLoading]       = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    fetch('/api/employer/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then((d: { notifications?: Notification[] }) => setNotifications(d.notifications ?? []))
      .catch(() => {/* non-fatal */})
      .finally(() => setLoading(false));
  }, []);

  // Load read IDs from localStorage on mount, then fetch notifications
  useEffect(() => {
    setReadIds_(readIds());
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !readIds_.has(n.id)).length;

  const handleOpen = () => {
    setOpen(v => !v);
    // Re-fetch when opening so data is fresh
    if (!open) fetchNotifications();
  };

  const markAllRead = () => {
    const all = new Set<string>(notifications.map(n => n.id));
    setReadIds_(all);
    saveReadIds(all);
  };

  const markRead = (id: string) => {
    const next = new Set(readIds_);
    next.add(id);
    setReadIds_(next);
    saveReadIds(next);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {/* Dropdown header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-bold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-medium text-[#6B46C1] hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-[#6B46C1] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No notifications yet</p>
            ) : (
              notifications.map(n => {
                const isUnread = !readIds_.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex cursor-pointer items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-purple-50/40' : ''}`}
                  >
                    {/* Unread dot */}
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-[#6B46C1]' : 'bg-transparent'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold text-gray-900">{n.candidateName}</span>
                        {' '}applied for{' '}
                        <span className="font-semibold text-gray-900">{n.jobTitle}</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400">{timeAgo(n.appliedAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link href="/employer/applications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-[#6B46C1] hover:underline">
                View all applications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function EmployerShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { employer } = useEmployerStore();
  const { activeUser } = useAppAuth();
  const shellDisplayName = activeUser?.type === 'employer' ? activeUser.employer.name : (employer.name || 'My Company');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 overflow-hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 overflow-hidden">
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop top bar */}
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 lg:flex">
          <p className="text-sm font-semibold text-gray-700">{shellDisplayName}</p>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Link href="/" aria-label="Visit website" title="Go to KaamKaaj"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#6B46C1]">
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Mobile header */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-gray-900">{shellDisplayName}</span>
          </div>
          <Link href="/" aria-label="Visit website" title="Go to KaamKaaj"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#6B46C1]">
            <Globe className="h-5 w-5" />
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
