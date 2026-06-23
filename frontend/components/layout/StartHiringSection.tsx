'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { useAppAuth } from '@/context/AppAuthContext';
import { useModalStore } from '@/store/modalStore';

interface StartHiringSectionProps {
  cities: string[];
  initialCount?: number;
}

// Logged-in employers/recruiters go straight to their job-post form. Anyone
// else (candidate, admin, or signed out) gets the in-page Employer login/
// create-account modal instead of being bounced to a full /signup page.
export function StartHiringSection({ cities, initialCount = 12 }: StartHiringSectionProps) {
  const { dbUser } = useAuth();
  const { data: nextSession } = useSession();
  const { activeUser, isLoggedIn: appLoggedIn } = useAppAuth();
  const { openRegister } = useModalStore();

  const role =
    nextSession?.user?.role?.toUpperCase()
    ?? (appLoggedIn ? (activeUser?.type === 'employer' ? 'EMPLOYER' : 'CANDIDATE') : undefined)
    ?? dbUser?.role;

  const canHireDirectly = role === 'EMPLOYER' || role === 'RECRUITER';

  const hireHref = (city: string) => {
    const encoded = encodeURIComponent(city);
    return role === 'EMPLOYER'
      ? `/employer/jobs/new?location=${encoded}`
      : `/recruiter/jobs?new=1&location=${encoded}`;
  };

  const linkCls = 'text-left text-sm text-gray-500 hover:text-gray-700 transition-colors';

  return (
    <div className="border-b border-gray-200 py-8">
      <h3 className="text-base font-semibold text-gray-900 mb-5">Start Hiring</h3>
      <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
        {cities.slice(0, initialCount).map((city) =>
          canHireDirectly ? (
            <Link key={city} href={hireHref(city)} className={linkCls}>
              Hire in {city}
            </Link>
          ) : (
            <button key={city} type="button" onClick={() => openRegister('EMPLOYER')} className={linkCls}>
              Hire in {city}
            </button>
          )
        )}
      </div>
      {cities.length > initialCount && (
        <Link
          href="/jobs"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          View more ↓
        </Link>
      )}
    </div>
  );
}
