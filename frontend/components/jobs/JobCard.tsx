import Link from 'next/link';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyInitial: string;
  companyBg: string;
  location: string;
  salary: string;
  jobType: 'Full-time' | 'Part-time' | 'Remote' | 'Contract';
  skills: string[];
  postedAt: string;
}

const JOB_TYPE_STYLES: Record<Job['jobType'], string> = {
  'Full-time': 'bg-green-50 text-green-700 border-green-200',
  Remote: 'bg-blue-50 text-blue-700 border-blue-200',
  'Part-time': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Contract: 'bg-purple-50 text-purple-700 border-purple-200',
};

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md">
      {/* Header: company initial + job type badge */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold',
            job.companyBg
          )}
        >
          {job.companyInitial}
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
            JOB_TYPE_STYLES[job.jobType]
          )}
        >
          {job.jobType}
        </span>
      </div>

      {/* Job title */}
      <h3 className="mt-3 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
        {job.title}
      </h3>

      {/* Company */}
      <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>

      {/* Location + Salary */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <span>{job.salary}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Footer: posted time + apply */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {job.postedAt}
        </span>
        <Link
          href={`/jobs/${job.id}`}
          className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
}
