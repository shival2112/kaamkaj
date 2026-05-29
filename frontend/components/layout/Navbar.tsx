'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { createSupabaseClient } from '@/lib/supabase';

const NAV_LINKS = [
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/for-employers', label: 'For Employers' },
  { href: '/about', label: 'About' },
] as const;

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

export function Navbar() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initializes auth listener and populates Zustand store
  const { user, dbUser, isLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    closeMobile();
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    clearUser();
    router.push('/');
    router.refresh();
  };

  const displayName = dbUser?.name ?? user?.email?.split('@')[0] ?? 'User';
  const dashPath = getDashboardPath(dbUser?.role ?? 'CANDIDATE');

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white transition-all duration-200',
        isScrolled ? 'shadow-md' : 'border-b border-border'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobile}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Kaam</span>
            <span className="text-foreground">Kaaj</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop: Auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            // Prevent layout shift while session loads
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
          ) : user ? (
            // Logged-in: avatar + dropdown
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-secondary"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {getInitials(displayName)}
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground lg:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-150',
                    isProfileOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-white py-1.5 shadow-lg">
                  <div className="border-b border-border px-4 py-2.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href={dashPath}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    Dashboard
                  </Link>
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
          ) : (
            // Logged-out: Login link + Sign Up outlined + Post a Job filled
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Button
                variant="outline"
                asChild
                className="border-primary text-primary hover:bg-secondary hover:text-primary"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button asChild>
                <Link href="/signup?role=employer">Post a Job</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
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
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-border pt-4">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {getInitials(displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href={dashPath}
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                >
                  Login
                </Link>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-primary text-primary hover:bg-secondary hover:text-primary"
                >
                  <Link href="/signup" onClick={closeMobile}>
                    Sign Up
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup?role=employer" onClick={closeMobile}>
                    Post a Job
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
