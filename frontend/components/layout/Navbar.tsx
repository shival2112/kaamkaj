'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';
import { useAppAuth } from '@/context/AppAuthContext';
import { useSession, signOut as nextSignOut } from 'next-auth/react';
import { useModalStore } from '@/store/modalStore';

interface NavLink {
  href: string;
  label: string;
  isNew: boolean;
  hasChevron?: boolean;
  hasDropdown?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: '/jobs', label: 'Jobs', isNew: false, hasChevron: true, hasDropdown: true },
  { href: '/companies', label: 'Companies', isNew: false },
  { href: '/job-prep', label: 'Job Prep', isNew: true },
  { href: '/contests', label: 'Contests', isNew: true },
  { href: '/degree', label: 'Degree', isNew: true },
  { href: '/resume-tools', label: 'Resume Tools', isNew: false },
];

const JOBS_DROPDOWN = {
  left: [
    { label: 'Work From Home Jobs', href: '/jobs?workMode=wfh' },
    { label: 'Part Time Jobs',      href: '/jobs?workType=part_time' },
    { label: 'Freshers Jobs',       href: '/jobs?workType=internship&experienceLevel=FRESHER' },
    { label: 'Jobs for Women',      href: '/jobs?q=women' },
    { label: 'Full Time Jobs',      href: '/jobs?workType=full_time' },
    { label: 'Night Shift Jobs',    href: '/jobs?shift=night' },
  ],
  right: [
    { label: 'Jobs By City',          href: '/jobs', sub: true },
    { label: 'Jobs By Department',    href: '/jobs', sub: true },
    { label: 'Jobs By Company',       href: '/companies', sub: true },
    { label: 'Jobs By Qualification', href: '/jobs?q=graduate', sub: true },
    { label: 'Others',                href: '/jobs', sub: true },
  ],
};

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );
}

function getDashboardPath(role: string): string {
  const r = role.toUpperCase();
  if (r === 'EMPLOYER') return '/employer/dashboard';
  if (r === 'ADMIN') return '/dashboard/admin';
  return '/dashboard';
}

function JobsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-0 w-[480px] rounded-xl border border-border bg-white shadow-xl z-50">
      <div className="grid grid-cols-2 gap-0 p-2">
        {/* Left column */}
        <div className="border-r border-border pr-2">
          {JOBS_DROPDOWN.left.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="block rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
        {/* Right column */}
        <div className="pl-2">
          {JOBS_DROPDOWN.right.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {label}
              <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen]   = useState(false);
  const [isScrolled, setIsScrolled]       = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen]       = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const jobsRef    = useRef<HTMLDivElement>(null);

  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);
  const { data: nextSession, status: nextStatus } = useSession();
  const { openLogin } = useModalStore();
  const { activeUser, isLoggedIn: appLoggedIn, logout: appLogout } = useAppAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (jobsRef.current && !jobsRef.current.contains(e.target as Node)) {
        setIsJobsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    closeMobile();
    if (user) {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      clearUser();
    }
    if (nextSession) await nextSignOut({ redirect: false });
    if (appLoggedIn) appLogout();
    router.push('/');
    router.refresh();
  };

  const nextUser = nextSession?.user;

  const displayName = nextUser
    ? (nextUser.companyName ?? nextUser.name ?? nextUser.phone ?? 'User')
    : appLoggedIn
    ? (activeUser?.type === 'employer' ? activeUser.employer.name : activeUser?.name) ?? 'User'
    : dbUser?.name ?? user?.email?.split('@')[0] ?? 'User';

  const dashPath = nextUser?.role === 'EMPLOYER' ? '/employer/dashboard'
    : nextUser?.role === 'CANDIDATE' ? '/dashboard'
    : appLoggedIn ? (activeUser?.type === 'employer' ? '/employer/dashboard' : '/dashboard')
    : getDashboardPath(dbUser?.role ?? 'CANDIDATE');

  const displaySub = nextUser?.phone ?? user?.email ?? (activeUser?.type === 'candidate' ? activeUser.phone : '');
  const isAnyLoggedIn = !!nextSession || !!user || appLoggedIn;
  const sessionLoading = isLoading || nextStatus === 'loading';

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white transition-all duration-200',
        isScrolled ? 'shadow-md' : 'border-b border-border'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={closeMobile} className="flex shrink-0 items-center gap-1.5 mr-2">
          <Image src="/logo.svg" alt="KaamKaaj logo" width={32} height={32} priority />
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            <span className="text-[#007a5a]">Kaam</span>
            <span className="text-[#1a1a1a]">Kaaj</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-3 md:flex">
          {NAV_LINKS.map((link) => (
            link.hasDropdown ? (
              <div key={link.href} className="relative" ref={jobsRef}>
                <button
                  onClick={() => setIsJobsOpen(v => !v)}
                  className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                  <ChevronDown className={cn('h-3 w-3 opacity-50 transition-transform', isJobsOpen && 'rotate-180')} />
                </button>
                {isJobsOpen && <JobsDropdown onClose={() => setIsJobsOpen(false)} />}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
                {link.isNew && (
                  <span className="inline-block rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    New
                  </span>
                )}
                {link.hasChevron && !link.hasDropdown && (
                  <ChevronDown className="h-3 w-3 opacity-50" />
                )}
              </Link>
            )
          ))}
        </div>

        {/* Desktop: Auth */}
        <div className="hidden items-center gap-2 md:flex">
          {sessionLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
          ) : isAnyLoggedIn ? (
            <>
              <Link
                href={dashPath}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(v => !v)}
                  className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-secondary"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {getInitials(displayName)}
                  </div>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground lg:block">
                    {displayName}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150', isProfileOpen && 'rotate-180')} />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-white py-1.5 shadow-lg">
                    <div className="border-b border-border px-4 py-2.5">
                      <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">{displaySub}</p>
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {dbUser?.role ?? 'CANDIDATE'}
                      </span>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => openLogin('EMPLOYER')}
                className="text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                Employer Login
              </button>
              <button
                onClick={() => openLogin('CANDIDATE')}
                className="inline-flex items-center justify-center rounded-lg bg-[#007a5a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#006a4e]"
              >
                Candidate Login
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen(prev => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 md:hidden',
          isMobileOpen ? 'max-h-screen border-t border-border' : 'max-h-0'
        )}
      >
        <div className="mx-auto max-w-7xl space-y-1 bg-white px-4 pb-5 pt-3">
          {NAV_LINKS.map((link) => (
            link.hasDropdown ? (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  {link.label}
                  <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-40" />
                </Link>
                <div className="ml-4 space-y-1">
                  {JOBS_DROPDOWN.left.map(({ label, href }) => (
                    <Link key={label} href={href} onClick={closeMobile}
                      className="block rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-primary">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                {link.label}
                {link.isNew && (
                  <span className="inline-block rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    New
                  </span>
                )}
              </Link>
            )
          ))}

          <div className="border-t border-border pt-4">
            {isAnyLoggedIn ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {getInitials(displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{displaySub}</p>
                  </div>
                </div>
                <Link href={dashPath} onClick={closeMobile}
                  className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => { closeMobile(); openLogin('EMPLOYER'); }}
                  className="block rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal-600 transition-colors hover:bg-secondary hover:text-teal-700">
                  Employer Login
                </button>
                <button onClick={() => { closeMobile(); openLogin('CANDIDATE'); }}
                  className="block w-full rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-white bg-[#007a5a] transition-colors hover:bg-[#006a4e]">
                  Candidate Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
