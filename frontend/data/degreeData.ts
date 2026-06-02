export interface UniversityUpdate {
  date: string;
  text: string;
}

export interface UniversityHighlight {
  param: string;
  desc: string;
}

export interface UniversityCourse {
  level: 'Masters' | 'Bachelors';
  name: string;
  duration: string;
  jobs: string;
  viewers: number;
}

export interface UniversityReview {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface University {
  slug: string;
  name: string;
  initials: string;
  location: string;
  rating: number;
  reviewCount: number;
  naac: string;
  founded: number;
  type: string;
  nirfRank: number;
  bannerColor: string;
  about: string[];
  updates: UniversityUpdate[];
  highlights: UniversityHighlight[];
  courses: UniversityCourse[];
  placements: { recruiters: string[] };
  reviews: UniversityReview[];
}

export const UNIVERSITIES: University[] = [
  {
    slug: 'chandigarh-university-online',
    name: 'Chandigarh University Online',
    initials: 'CU',
    location: 'Chandigarh, Punjab',
    rating: 4.4,
    reviewCount: 20,
    naac: 'A+',
    founded: 2012,
    type: 'Private',
    nirfRank: 19,
    bannerColor: 'from-blue-800 to-indigo-900',
    about: [
      'Founded in 2012 in Mohali, Punjab, Chandigarh University has grown rapidly across business, technology, communication, and sciences.',
      'CU Online delivers UGC-approved degrees through CU-VERSE, a custom LMS featuring live sessions, recorded lectures, e-library access, and remote examinations.',
      'Backed by NAAC A+ accreditation and 300+ hiring partners, CU Online provides flexible, career-focused education for working professionals across India.',
    ],
    updates: [
      { date: 'Dec 29, 2025', text: 'NAAC A+ accreditation renewed with strengthened academic processes.' },
      { date: 'Dec 28, 2025', text: 'CU-VERSE LMS upgraded for smoother access to recordings and assessments.' },
      { date: 'Dec 26, 2025', text: 'More industry partners added to the hiring network.' },
      { date: 'Dec 22, 2025', text: 'Online MBA and MCA programmes refreshed with industry-relevant modules.' },
      { date: 'Nov 20, 2025', text: 'Soft skills sessions and updated job-portal listings expanded.' },
    ],
    highlights: [
      { param: 'Established', desc: '2012' },
      { param: 'University Type', desc: 'Private' },
      { param: 'NIRF Ranking', desc: '19' },
      { param: 'NAAC Rating', desc: 'A+' },
      { param: 'Admission Mode', desc: 'Fully Online' },
      { param: 'Programmes Offered', desc: 'BBA, BCA, MBA, MCA, MA, M.Com' },
      { param: 'Industry Connect', desc: '300+ hiring partners' },
    ],
    courses: [
      { level: 'Masters', name: 'Online MBA', duration: '2 Years', jobs: '1,83,600+', viewers: 264 },
      { level: 'Masters', name: 'Online MCA', duration: '2 Years', jobs: '1,06,800+', viewers: 310 },
      { level: 'Masters', name: 'Online MA', duration: '2 Years', jobs: '51,100+', viewers: 180 },
      { level: 'Bachelors', name: 'Online BBA', duration: '3 Years', jobs: '95,000+', viewers: 220 },
      { level: 'Bachelors', name: 'Online BCA', duration: '3 Years', jobs: '88,000+', viewers: 198 },
    ],
    placements: {
      recruiters: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Capgemini', 'Accenture', 'IBM'],
    },
    reviews: [
      { name: 'Rahul M.', rating: 5, text: 'Great flexible learning. CU-VERSE made studying easy alongside my job.', date: 'Jan 2026' },
      { name: 'Priya S.', rating: 4, text: 'Good placement support. MBA curriculum is industry-relevant.', date: 'Dec 2025' },
      { name: 'Amit K.', rating: 4, text: 'Value for money. NAAC A+ gives the degree real credibility.', date: 'Nov 2025' },
    ],
  },
  {
    slug: 'amity-university-online',
    name: 'Amity University Online',
    initials: 'AU',
    location: 'Noida, Uttar Pradesh',
    rating: 4.3,
    reviewCount: 35,
    naac: 'A+',
    founded: 2005,
    type: 'Private',
    nirfRank: 32,
    bannerColor: 'from-red-700 to-orange-800',
    about: [
      'Amity University Online is a pioneer in digital education offering UGC-approved programs accessible from anywhere in India.',
      'The university provides a robust LMS with live faculty interaction, recorded lectures, digital library access, and online examinations.',
      "Amity's strong alumni network and industry tie-ups make it a preferred choice for working professionals seeking quality online degrees.",
    ],
    updates: [
      { date: 'Jan 5, 2026', text: 'New MBA specializations added in Healthcare Management and Digital Marketing.' },
      { date: 'Dec 15, 2025', text: 'Placement cell expanded with 50 new corporate partners.' },
      { date: 'Nov 30, 2025', text: 'Scholarship program launched for meritorious students.' },
      { date: 'Nov 10, 2025', text: 'Live doubt-solving sessions added for all MBA batches.' },
      { date: 'Oct 25, 2025', text: 'New e-library resources added across all programs.' },
    ],
    highlights: [
      { param: 'Established', desc: '2005' },
      { param: 'University Type', desc: 'Private' },
      { param: 'NIRF Ranking', desc: '32' },
      { param: 'NAAC Rating', desc: 'A+' },
      { param: 'Admission Mode', desc: 'Fully Online' },
      { param: 'Programmes Offered', desc: 'BBA, B.Com, MBA, M.Com' },
      { param: 'Industry Connect', desc: '200+ hiring partners' },
    ],
    courses: [
      { level: 'Masters', name: 'Online MBA', duration: '2 Years', jobs: '2,00,000+', viewers: 312 },
      { level: 'Masters', name: 'Online M.Com', duration: '2 Years', jobs: '60,000+', viewers: 145 },
      { level: 'Bachelors', name: 'Online BBA', duration: '3 Years', jobs: '95,000+', viewers: 201 },
      { level: 'Bachelors', name: 'Online B.Com', duration: '3 Years', jobs: '80,000+', viewers: 175 },
    ],
    placements: {
      recruiters: ['Deloitte', 'KPMG', 'EY', 'PwC', 'Amazon', 'Flipkart', 'HDFC', 'ICICI'],
    },
    reviews: [
      { name: 'Sneha R.', rating: 5, text: "Amity's brand value really helped in placements. Great overall experience.", date: 'Feb 2026' },
      { name: 'Karan P.', rating: 4, text: 'Faculty is very supportive. Online MBA content is top-notch.', date: 'Jan 2026' },
      { name: 'Divya L.', rating: 4, text: 'Flexible schedule was perfect for me as a working professional.', date: 'Dec 2025' },
    ],
  },
  {
    slug: 'manipal-university-online',
    name: 'Manipal University Online',
    initials: 'MU',
    location: 'Manipal, Karnataka',
    rating: 4.5,
    reviewCount: 48,
    naac: 'A++',
    founded: 1953,
    type: 'Private',
    nirfRank: 14,
    bannerColor: 'from-green-700 to-teal-800',
    about: [
      'Manipal University, established in 1953, is one of India\'s most prestigious private universities with decades of academic excellence.',
      'Manipal Online offers NAAC A++ rated programs through an interactive LMS with live classes, project-based learning, and mentorship programs.',
      'With a global alumni network spanning 100+ countries and strong corporate partnerships, Manipal ensures solid career support for graduates.',
    ],
    updates: [
      { date: 'Jan 10, 2026', text: 'NAAC A++ reaccreditation confirmed for another 5-year cycle.' },
      { date: 'Dec 20, 2025', text: 'New AI and Data Science MBA specialization launched.' },
      { date: 'Dec 1, 2025', text: 'International placement tie-ups added with companies in UAE and Singapore.' },
      { date: 'Nov 15, 2025', text: 'Online BCA curriculum updated with cloud computing modules.' },
      { date: 'Oct 30, 2025', text: 'Alumni mentorship program expanded with 100 new mentors.' },
    ],
    highlights: [
      { param: 'Established', desc: '1953' },
      { param: 'University Type', desc: 'Private' },
      { param: 'NIRF Ranking', desc: '14' },
      { param: 'NAAC Rating', desc: 'A++' },
      { param: 'Admission Mode', desc: 'Fully Online' },
      { param: 'Programmes Offered', desc: 'BCA, BBA, MBA, MCA' },
      { param: 'Industry Connect', desc: '400+ hiring partners' },
    ],
    courses: [
      { level: 'Masters', name: 'Online MBA', duration: '2 Years', jobs: '2,50,000+', viewers: 421 },
      { level: 'Masters', name: 'Online MCA', duration: '2 Years', jobs: '1,20,000+', viewers: 298 },
      { level: 'Bachelors', name: 'Online BCA', duration: '3 Years', jobs: '1,00,000+', viewers: 256 },
      { level: 'Bachelors', name: 'Online BBA', duration: '3 Years', jobs: '95,000+', viewers: 189 },
    ],
    placements: {
      recruiters: ['Google', 'Microsoft', 'Adobe', 'Oracle', 'Salesforce', 'SAP', 'Infosys', 'TCS'],
    },
    reviews: [
      { name: 'Arjun T.', rating: 5, text: "Manipal's reputation is unmatched. The MBA program exceeded my expectations.", date: 'Feb 2026' },
      { name: 'Meera N.', rating: 5, text: 'NAAC A++ speaks for itself. Amazing learning experience throughout.', date: 'Jan 2026' },
      { name: 'Rohit S.', rating: 4, text: 'Excellent faculty and course content. Highly recommend for working professionals.', date: 'Dec 2025' },
    ],
  },
];

export function getUniversityBySlug(slug: string): University | undefined {
  return UNIVERSITIES.find((u) => u.slug === slug);
}
