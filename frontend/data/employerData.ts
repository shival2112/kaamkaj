export type JobStatus = 'active' | 'paused' | 'closed';
export type CandidateStatus =
  | 'new'
  | 'reviewed'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'hired'
  | 'rejected';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Employer {
  name: string;
  initials: string;
  industry: string;
  location: string;
  website: string;
  about: string;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  experience: string;
  skills: string[];
  openings: number;
  deadline: string;
  urgent: boolean;
  status: JobStatus;
  description: string;
  postedDate: string;
  views: number;
}

export interface Candidate {
  id: string;
  name: string;
  experience: string;
  skills: string[];
  jobId: string;
  appliedDate: string;
  status: CandidateStatus;
  stage: string;
  notes: string;
}

export interface QuestionResult {
  question: string;
  category: string;
  difficulty: string;
  rating: 'good' | 'average' | 'poor' | null;
  notes: string;
}

export interface FeedbackData {
  overall: number;
  technical: number;
  communication: number;
  culturalFit: number;
  problemSolving: number;
  strengths: string;
  improvements: string;
  recommendation: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  round: string;
  date: string;
  time: string;
  mode: string;
  link: string;
  interviewer: string;
  status: InterviewStatus;
  questions?: QuestionResult[];
  feedback?: FeedbackData;
}

export const PIPELINE_STAGES = [
  'Applied',
  'Shortlisted',
  'HR Round',
  'Technical Round',
  'Final Round',
  'Offer',
] as const;

export const INITIAL_EMPLOYER: Employer = {
  name: 'TechNova HR',
  initials: 'TH',
  industry: 'Technology',
  location: 'Bangalore, Karnataka',
  website: 'technova.demo',
  about: 'TechNova builds SaaS products for enterprise clients across India.',
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    location: 'Bangalore',
    type: 'Full Time',
    experience: '1-3 yrs',
    skills: ['React', 'Tailwind', 'JavaScript'],
    openings: 2,
    deadline: '2026-07-01',
    urgent: true,
    status: 'active',
    description: 'Build and maintain React-based web applications.',
    postedDate: '2026-05-15',
    views: 340,
  },
  {
    id: 'j2',
    title: 'Backend Engineer',
    location: 'Remote',
    type: 'Full Time',
    experience: '3-5 yrs',
    skills: ['Node.js', 'MongoDB', 'REST API'],
    openings: 1,
    deadline: '2026-07-15',
    urgent: false,
    status: 'active',
    description: 'Design scalable backend services and APIs.',
    postedDate: '2026-05-18',
    views: 210,
  },
  {
    id: 'j3',
    title: 'HR Coordinator',
    location: 'Mumbai',
    type: 'Part Time',
    experience: 'Fresher',
    skills: ['Communication', 'MS Office'],
    openings: 3,
    deadline: '2026-06-20',
    urgent: false,
    status: 'paused',
    description: 'Assist with recruitment and onboarding processes.',
    postedDate: '2026-05-01',
    views: 95,
  },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Aisha Sharma',
    experience: '2 yrs',
    skills: ['React', 'JavaScript'],
    jobId: 'j1',
    appliedDate: '2026-05-20',
    status: 'shortlisted',
    stage: 'Technical Round',
    notes: '',
  },
  {
    id: 'c2',
    name: 'Rohan Mehta',
    experience: '1 yr',
    skills: ['React', 'Tailwind'],
    jobId: 'j1',
    appliedDate: '2026-05-21',
    status: 'new',
    stage: 'Applied',
    notes: '',
  },
  {
    id: 'c3',
    name: 'Priya Nair',
    experience: '4 yrs',
    skills: ['Node.js', 'MongoDB'],
    jobId: 'j2',
    appliedDate: '2026-05-22',
    status: 'interview_scheduled',
    stage: 'HR Round',
    notes: '',
  },
  {
    id: 'c4',
    name: 'Vikram Das',
    experience: 'Fresher',
    skills: ['Communication'],
    jobId: 'j3',
    appliedDate: '2026-05-19',
    status: 'reviewed',
    stage: 'Applied',
    notes: '',
  },
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'i1',
    candidateId: 'c3',
    jobId: 'j2',
    round: 'HR Round',
    date: '2026-06-05',
    time: '11:00 AM',
    mode: 'Online',
    link: 'meet.google.com/demo-link',
    interviewer: 'Neha Kapoor',
    status: 'scheduled',
  },
  {
    id: 'i2',
    candidateId: 'c1',
    jobId: 'j1',
    round: 'Technical Round',
    date: '2026-06-07',
    time: '2:00 PM',
    mode: 'Online',
    link: 'meet.google.com/demo-link-2',
    interviewer: 'Raj Patel',
    status: 'scheduled',
  },
];
