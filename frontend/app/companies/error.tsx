'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function CompaniesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Building2 className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Failed to load companies</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t fetch company listings right now. Please check your connection and try again.
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
