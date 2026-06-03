import { Skeleton } from '@/components/ui/Skeleton';

export default function CompanyDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-secondary to-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Skeleton className="mb-6 h-5 w-32" />
          <div className="flex gap-5">
            <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-5">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
              <Skeleton className="h-5 w-32" />
              {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
              <Skeleton className="h-5 w-40" />
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-64 rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
            <Skeleton className="h-5 w-36" />
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
