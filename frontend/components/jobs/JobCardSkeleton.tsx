import { Skeleton } from '@/components/ui/Skeleton';

export function JobCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-1.5 h-4 w-1/2" />

      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}
