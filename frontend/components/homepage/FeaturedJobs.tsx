import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import type { Job } from '@/components/jobs/JobCard';

const FEATURED_JOBS: Job[] = [
  {
    id: '1',
    title: 'Sales Executive',
    company: 'Reliance Retail Ltd.',
    companyInitial: 'R',
    companyBg: 'bg-blue-100 text-blue-700',
    location: 'Mumbai, Maharashtra',
    salary: '₹25,000 – ₹35,000/mo',
    jobType: 'Full-time',
    skills: ['Sales', 'Communication', 'B2B'],
    postedAt: '2 days ago',
  },
  {
    id: '2',
    title: 'Senior Software Engineer',
    company: 'Infosys Limited',
    companyInitial: 'I',
    companyBg: 'bg-violet-100 text-violet-700',
    location: 'Bengaluru, Karnataka',
    salary: '₹12 – ₹18 LPA',
    jobType: 'Full-time',
    skills: ['React', 'Node.js', 'TypeScript'],
    postedAt: '1 day ago',
  },
  {
    id: '3',
    title: 'Delivery Partner',
    company: 'Swiggy',
    companyInitial: 'S',
    companyBg: 'bg-orange-100 text-orange-700',
    location: 'Delhi NCR',
    salary: '₹18,000 – ₹28,000/mo',
    jobType: 'Full-time',
    skills: ['Driving', 'Local Routes', '2-Wheeler'],
    postedAt: '3 days ago',
  },
  {
    id: '4',
    title: 'Customer Service Executive (BPO)',
    company: 'Concentrix',
    companyInitial: 'C',
    companyBg: 'bg-green-100 text-green-700',
    location: 'Hyderabad, Telangana',
    salary: '₹15,000 – ₹22,000/mo',
    jobType: 'Full-time',
    skills: ['English', 'Customer Service', 'CRM'],
    postedAt: '1 day ago',
  },
  {
    id: '5',
    title: 'React Frontend Developer',
    company: 'Wipro Technologies',
    companyInitial: 'W',
    companyBg: 'bg-yellow-100 text-yellow-700',
    location: 'Remote',
    salary: '₹8 – ₹14 LPA',
    jobType: 'Remote',
    skills: ['React', 'JavaScript', 'Tailwind'],
    postedAt: '5 hours ago',
  },
  {
    id: '6',
    title: 'Accounts Executive',
    company: 'HDFC Bank',
    companyInitial: 'H',
    companyBg: 'bg-red-100 text-red-700',
    location: 'Pune, Maharashtra',
    salary: '₹20,000 – ₹30,000/mo',
    jobType: 'Full-time',
    skills: ['Tally', 'MS Excel', 'Accounting'],
    postedAt: '4 days ago',
  },
];

export function FeaturedJobs() {
  return (
    <section className="bg-[#F9FAFB] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Featured Jobs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked opportunities just for you
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline sm:flex"
          >
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            View All Jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
