// Re-export all Prisma-generated types so the rest of the app imports from here
export type {
  User,
  Company,
  Job,
  Application,
  SavedJob,
  Resume,
} from '@prisma/client';

export {
  Role,
  JobType,
  ExperienceLevel,
  JobStatus,
  ApplicationStatus,
} from '@prisma/client';

// ─── Composite types used across the app ─────────────────────────────────────

import type { Job, Company, Application, User } from '@prisma/client';

export type JobWithCompany = Job & {
  company: Company;
  _count?: { applications: number };
};

export type ApplicationWithJob = Application & {
  job: JobWithCompany;
};

export type ApplicationWithCandidate = Application & {
  candidate: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'phone'>;
};
