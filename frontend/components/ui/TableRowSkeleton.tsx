import { Skeleton } from '@/components/ui/Skeleton';

interface Props {
  cols?: number;
  rows?: number;
}

export function TableRowSkeleton({ cols = 5, rows = 5 }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
          ))}
        </div>
      ))}
    </>
  );
}
