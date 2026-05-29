'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SaveButtonProps {
  jobId: string;
  initialSaved?: boolean;
  /** 'icon' = icon-only button (for cards), 'full' = full-width button (for detail page) */
  variant?: 'icon' | 'full';
}

export function SaveButton({ jobId, initialSaved = false, variant = 'icon' }: SaveButtonProps) {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const [saved,   setSaved]   = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) { router.push(`/login?redirect=/jobs/${jobId}`); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, {
        method: saved ? 'DELETE' : 'POST',
      });
      if (res.ok) setSaved((v) => !v);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'full') {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60',
          saved
            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
            : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
        )}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Bookmark className={cn('h-4 w-4', saved && 'fill-primary')} />
        }
        {saved ? 'Saved' : 'Save Job'}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(); }}
      disabled={loading}
      aria-label={saved ? 'Unsave job' : 'Save job'}
      className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary disabled:opacity-60"
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Bookmark className={cn('h-4 w-4', saved && 'fill-primary text-primary')} />
      }
    </button>
  );
}
