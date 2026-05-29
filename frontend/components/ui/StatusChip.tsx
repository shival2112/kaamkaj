import { cn } from '@/lib/utils';

export type ApplicationStatus =
  | 'Applied'
  | 'Reviewing'
  | 'Shortlisted'
  | 'Interview'
  | 'Rejected'
  | 'Offered'
  | 'Hired';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Applied:     'bg-gray-100 text-gray-600',
  Reviewing:   'bg-sky-50 text-sky-700',
  Shortlisted: 'bg-yellow-50 text-yellow-700',
  Interview:   'bg-blue-50 text-blue-700',
  Rejected:    'bg-red-50 text-red-600',
  Offered:     'bg-green-50 text-green-700',
  Hired:       'bg-emerald-50 text-emerald-700',
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

/** Maps Prisma ApplicationStatus enum → display ApplicationStatus */
export function mapDbStatus(dbStatus: string): ApplicationStatus {
  const map: Record<string, ApplicationStatus> = {
    APPLIED:     'Applied',
    REVIEWING:   'Reviewing',
    SHORTLISTED: 'Shortlisted',
    REJECTED:    'Rejected',
    HIRED:       'Hired',
  };
  return map[dbStatus] ?? 'Applied';
}
