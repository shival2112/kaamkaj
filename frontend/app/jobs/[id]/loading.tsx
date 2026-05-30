import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function JobDetailLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Header card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-5 w-1/3" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Skills card */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72 xl:w-80">
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <div className="border-t border-border pt-4 space-y-2.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
