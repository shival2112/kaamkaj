'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSession } from 'next-auth/react';

interface ApplyButtonProps {
  jobId: string;
  alreadyApplied: boolean;
}

export function ApplyButton({ jobId, alreadyApplied: initial }: ApplyButtonProps) {
  const router = useRouter();

  // Supabase session (email/password candidates)
  const user     = useAuthStore((s) => s.user);
  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();

  // NextAuth session (phone OTP candidates)
  const { data: nextSession } = useSession();
  const nextRole = (nextSession?.user?.role as string ?? '').toUpperCase();

  const [applied, setApplied] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Employers and admins see nothing
  if (userRole === 'EMPLOYER' || userRole === 'ADMIN') return null;
  if (nextRole === 'EMPLOYER') return null;

  // Neither Supabase nor NextAuth has a candidate session → prompt login
  const isLoggedInCandidate =
    (!!user && userRole === 'CANDIDATE') ||
    (!!nextSession?.user && nextRole === 'CANDIDATE') ||
    // Default: any logged-in user who isn't employer/admin is treated as candidate
    (!!user && userRole === '') ||
    (!!nextSession?.user && nextRole === '');

  if (!isLoggedInCandidate) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/jobs/${jobId}`)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <Send className="h-4 w-4" />
        Login to Apply
      </button>
    );
  }

  if (applied) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-success/10 px-6 py-3 text-sm font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" />
        Applied Successfully
      </div>
    );
  }

  const handleApply = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST' });
      if (res.status === 201) {
        setApplied(true);
      } else if (res.status === 409) {
        setApplied(true); // already applied
      } else {
        const body = await res.json() as { error?: string; code?: string };
        if (body.code === 'PROFILE_INCOMPLETE') {
          router.push('/dashboard/onboarding');
          return;
        }
        setError(body.error ?? 'Something went wrong. Try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleApply}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Submitting…' : 'Apply Now'}
      </button>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
