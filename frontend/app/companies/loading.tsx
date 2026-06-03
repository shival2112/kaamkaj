import { Skeleton } from '@/components/ui/Skeleton';

export default function CompaniesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-36" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full shrink-0 rounded-xl border border-border bg-white p-5 shadow-sm lg:w-64 space-y-5">
            <Skeleton className="h-5 w-20" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                {[0, 1, 2].map((j) => <Skeleton key={j} className="h-5 w-full" />)}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between border-t border-border pt-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
