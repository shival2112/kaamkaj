import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  /** Weekly delta string, e.g. "+4 this week" or "-2 this week" */
  change: string;
  className?: string;
}

export function KPICard({ icon, label, value, change, className }: KPICardProps) {
  const isPositive = change.trimStart().startsWith('+');
  const isNegative = change.trimStart().startsWith('-');

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm',
        className
      )}
    >
      {/* Icon bubble */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      {/* Label */}
      <p className="text-sm text-muted-foreground">{label}</p>

      {/* Big number */}
      <p className="text-3xl font-bold text-foreground">{value}</p>

      {/* Weekly change */}
      <p
        className={cn(
          'text-xs font-medium',
          isPositive && 'text-success',
          isNegative && 'text-danger',
          !isPositive && !isNegative && 'text-muted-foreground'
        )}
      >
        {change}
      </p>
    </div>
  );
}
