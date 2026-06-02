export interface ContestRound {
  name: string;
  duration: string;
  description: string;
}

export interface ContestFaq {
  q: string;
  a: string;
}

export interface Contest {
  slug: string;
  name: string;
  organizer: string;
  status: 'live' | 'closed';
  registrationDeadline: string;
  participants: number;
  reward: string;
  rewardType: string;
  bannerColor: string;
  description: string;
  eligibility: string[];
  rounds: ContestRound[];
  prizes: string[];
  organiserAbout: string;
  faq: ContestFaq[];
  partners: string[];
}

// Anchored to project "now" so dates remain valid regardless of build time
const BASE = new Date('2026-06-01T00:00:00.000Z').getTime();

export const CONTESTS: Contest[] = [
  {
    slug: 'tech-quiz-challenge',
    name: 'Tech Quiz Challenge',
    organizer: 'CodeCraft',
    status: 'live',
    registrationDeadline: new Date(BASE + 2 * 86_400_000).toISOString(),
    participants: 1240,
    reward: 'Certificate + Top 3 get goodies',
    rewardType: 'Free Learning Contest',
    bannerColor: 'from-teal-700 to-blue-800',
    description:
      'A fun online quiz testing your knowledge of web development, DSA, and system design fundamentals. Open to all learners.',
    eligibility: [
      'Anyone can participate',
      'No prior experience needed',
      'Individual participation only',
    ],
    rounds: [
      {
        name: 'Qualifier Round',
        duration: '20 minutes',
        description: '30 MCQs on programming basics and logic',
      },
      {
        name: 'Final Round',
        duration: '30 minutes',
        description: 'Advanced questions on DSA and system design',
      },
    ],
    prizes: [
      'Top 3 winners get a participation goody bag',
      'All participants receive a certificate',
      'Leaderboard recognition',
    ],
    organiserAbout:
      'CodeCraft is a student-run community promoting free tech learning events.',
    faq: [
      { q: 'Is this contest free?', a: 'Yes, completely free.' },
      {
        q: 'When are results announced?',
        a: 'Within 3 days after the contest ends.',
      },
      {
        q: 'Can I participate from mobile?',
        a: 'Yes, the quiz works on all devices.',
      },
    ],
    partners: ['TechClub', 'OpenSource India', 'DevCircle'],
  },
  {
    slug: 'resume-writing-challenge',
    name: 'Resume Writing Challenge',
    organizer: 'CareerBoost',
    status: 'live',
    registrationDeadline: new Date(BASE + 5 * 86_400_000).toISOString(),
    participants: 870,
    reward: 'Certificate + Resume Review by Experts',
    rewardType: 'Free Skill Contest',
    bannerColor: 'from-orange-600 to-red-700',
    description:
      'Submit your best resume and get it reviewed by industry experts. Learn what makes a great resume through this hands-on challenge.',
    eligibility: [
      'Students and freshers',
      '0–2 years experience',
      'Any field',
    ],
    rounds: [
      {
        name: 'Resume Submission',
        duration: 'Open for 5 days',
        description: 'Submit your resume in PDF format',
      },
      {
        name: 'Expert Review',
        duration: '3 days',
        description: 'Top 20 resumes reviewed live with feedback',
      },
    ],
    prizes: [
      'Top 5 get a 1:1 expert resume review session',
      'All participants get written feedback',
      'Certificate for all',
    ],
    organiserAbout:
      'CareerBoost is a non-profit initiative helping freshers land their first job.',
    faq: [
      {
        q: 'What format should the resume be in?',
        a: 'PDF only, max 2 pages.',
      },
      {
        q: 'Who reviews the resumes?',
        a: 'Volunteer HR professionals from the community.',
      },
    ],
    partners: ['HRConnect', 'FreshersHub'],
  },
  {
    slug: 'data-viz-hackathon',
    name: 'Data Viz Hackathon',
    organizer: 'DataNerds Club',
    status: 'closed',
    registrationDeadline: '2026-04-10T23:59:59.000Z',
    participants: 3100,
    reward: 'Certificate + Leaderboard Recognition',
    rewardType: 'Free Learning Hackathon',
    bannerColor: 'from-purple-700 to-indigo-900',
    description:
      'Build a data visualization dashboard using any free tool (Google Sheets, Tableau Public, Power BI free). A beginner-friendly hackathon.',
    eligibility: [
      'Open to all',
      'Teams of 1–3 allowed',
      'No paid tools required',
    ],
    rounds: [
      {
        name: 'Idea Submission',
        duration: '48 hours',
        description: 'Submit your dataset choice and visualization plan',
      },
      {
        name: 'Final Dashboard',
        duration: '72 hours',
        description: 'Submit your completed visualization',
      },
    ],
    prizes: [
      'Top 10 featured on community website',
      'Certificates for all finishers',
    ],
    organiserAbout:
      'DataNerds Club is a volunteer-run community of data enthusiasts sharing free resources.',
    faq: [
      { q: 'Do I need paid software?', a: 'No, only free tools are allowed.' },
      { q: 'Can I work alone?', a: 'Yes, solo participation is welcome.' },
    ],
    partners: ['OpenData India', 'Kaggle Community'],
  },
];

export function getContestBySlug(slug: string): Contest | undefined {
  return CONTESTS.find((c) => c.slug === slug);
}
