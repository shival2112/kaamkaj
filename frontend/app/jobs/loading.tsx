import { JobCardSkeleton } from '@/components/jobs/JobCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-36" />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 sm:w-52" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Filter sidebar skeleton */}
          <div className="w-full shrink-0 rounded-xl border border-border bg-white p-5 shadow-sm lg:w-64 space-y-5">
            <Skeleton className="h-5 w-20" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Card grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
