'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAppAuth } from '@/context/AppAuthContext';

function getDashboardPath(role: string): string {
  const r = role.toUpperCase();
  if (r === 'EMPLOYER') return '/employer/dashboard';
  if (r === 'ADMIN') return '/dashboard/admin';
  return '/dashboard';
}

// Mirrors the login-state detection in Navbar.tsx so the sitemap never offers
// Login/Sign Up to a user who's already authenticated.
export function SitemapAccountSection() {
  const user = useAuthStore((s) => s.user);
  const dbUser = useAuthStore((s) => s.dbUser);
  const { data: nextSession } = useSession();
  const { activeUser, isLoggedIn: appLoggedIn } = useAppAuth();

  const isLoggedIn = !!nextSession || !!user || appLoggedIn;

  const dashPath = nextSession?.user
    ? getDashboardPath((nextSession.user as { role?: string }).role ?? 'CANDIDATE')
    : appLoggedIn
    ? (activeUser?.type === 'employer' ? '/employer/dashboard' : '/dashboard')
    : getDashboardPath(dbUser?.role ?? 'CANDIDATE');

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Account</h2>
      <ul className="mt-3 space-y-2.5">
        {isLoggedIn ? (
          <li>
            <Link
              href={dashPath}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
