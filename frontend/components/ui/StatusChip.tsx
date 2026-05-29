import { cn } from '@/lib/utils';

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Offered';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied: 'bg-gray-100 text-gray-600',
  Shortlisted: 'bg-yellow-50 text-yellow-700',
  Interview: 'bg-blue-50 text-blue-700',
  Offered: 'bg-green-50 text-green-700',
};

interface StatusChipProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
