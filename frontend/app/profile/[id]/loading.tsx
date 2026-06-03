import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-secondary to-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Skeleton className="mb-6 h-5 w-24" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-40" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
