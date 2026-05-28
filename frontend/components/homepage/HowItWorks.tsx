'use client';

import { useState } from 'react';
import {
  User,
  Search,
  CheckCircle,
  Building2,
  FileText,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CANDIDATE_STEPS = [
  {
    icon: User,
    title: 'Create Your Profile',
    description:
      'Sign up in minutes. Add your skills, experience, and upload your resume to stand out.',
  },
  {
    icon: Search,
    title: 'Search & Apply',
    description:
      'Browse thousands of jobs. Filter by location, salary, job type, and industry.',
  },
  {
    icon: CheckCircle,
    title: 'Get Hired',
    description:
      'Get shortlisted, attend interviews, and land the job you deserve.',
  },
] as const;

const EMPLOYER_STEPS = [
  {
    icon: Building2,
    title: 'Create Company Profile',
    description:
      'Set up your employer account and showcase your company culture and values.',
  },
  {
    icon: FileText,
    title: 'Post a Job',
    description:
      'Create detailed job listings and instantly reach millions of active job seekers.',
  },
  {
    icon: Users,
    title: 'Hire the Best',
    description:
      'Review applications, schedule interviews, and hire the perfect candidate fast.',
  },
] as const;

type Tab = 'candidates' | 'employers';

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<Tab>('candidates');
  const steps = activeTab === 'candidates' ? CANDIDATE_STEPS : EMPLOYER_STEPS;

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            How KaamKaaj Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to start your journey
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-full bg-secondary p-1">
            <button
              onClick={() => setActiveTab('candidates')}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200',
                activeTab === 'candidates'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              For Job Seekers
            </button>
            <button
              onClick={() => setActiveTab('employers')}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200',
                activeTab === 'employers'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              For Employers
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="flex flex-col items-center text-center">
              {/* Icon circle with step number */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>

              {/* Connector (desktop) — rendered as a border on the step card */}
              <div className="mt-5">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {activeTab === 'candidates' ? (
            <a
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Find Jobs Now
            </a>
          ) : (
            <a
              href="/signup?role=employer"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Post a Job Free
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
