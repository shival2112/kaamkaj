'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle className="h-7 w-7 text-danger" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
