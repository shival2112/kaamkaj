'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

export default function JobDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white py-20 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Failed to load job</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {error.message || 'This job could not be loaded. It may have been removed.'}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/jobs"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
