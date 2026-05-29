'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface ApplyButtonProps {
  jobId: string;
  alreadyApplied: boolean;
}

export function ApplyButton({ jobId, alreadyApplied: initial }: ApplyButtonProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const userRole = ((user?.user_metadata?.role as string) ?? '').toUpperCase();

  const [applied, setApplied]   = useState(initial);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (userRole === 'EMPLOYER' || userRole === 'ADMIN') return null;

  if (!user) {
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
        const body = await res.json();
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
