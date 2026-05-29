'use client';

import { useState } from 'react';
import { MapPin, IndianRupee, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusChip, type ApplicationStatus } from './StatusChip';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary: string;
  stage: ApplicationStatus;
  /** Full Tailwind bg class for the company tile, e.g. "bg-indigo-500" */
  companyColor: string;
  className?: string;
}

export function JobCard({
  title,
  company,
  location,
  salary,
  stage,
  companyColor,
  className,
}: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm',
        'transition-all duration-150 hover:border-primary/30 hover:shadow-md',
        className
      )}
    >
      {/* Header row: company tile + bookmark */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white',
            companyColor
          )}
        >
          {company.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => setBookmarked((b) => !b)}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark job'}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <Bookmark
            className={cn('h-4 w-4', bookmarked && 'fill-primary text-primary')}
          />
        </button>
      </div>

      {/* Title + company */}
      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{company}</p>

      {/* Location + salary */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
          <span>{salary}</span>
        </div>
      </div>

      {/* Footer: application stage */}
      <div className="mt-4 border-t border-border pt-3">
        <StatusChip status={stage} />
      </div>
    </div>
  );
}
