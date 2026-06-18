/**
 * Seed script: adds jobs to the two existing employer companies so that each
 * "Popular Searches" category on the homepage (Jobs for Freshers, Work from
 * home Jobs, Part time Jobs, Jobs for Women, Full time Jobs) returns results
 * when "View all" is clicked (/jobs?q=<label>).
 *
 * The /jobs page filters by `q` as a case-insensitive `contains` on title/
 * description/skills, so each job description below includes the exact
 * category phrase verbatim.
 *
 * Run from frontend/: node scripts/seed-popular-search-jobs.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLines = readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const now = new Date().toISOString();
const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

const { data: companies, error: coErr } = await supabase
  .from('companies').select('id, name').order('created_at', { ascending: true });
if (coErr) { console.error(coErr.message); process.exit(1); }
if (!companies || companies.length < 2) {
  console.error('Expected at least 2 employer companies to exist already.');
  process.exit(1);
}
const [companyA, companyB] = companies;
console.log(`Using companies: ${companyA.name} / ${companyB.name}`);

const JOBS = [
  // Jobs for Freshers
  { company_id: companyA.id, title: 'Junior Software Developer', location: 'Pune',
    salary_min: 350000, salary_max: 500000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['JavaScript', 'HTML', 'CSS', 'Git'],
    description: 'Great Jobs for Freshers looking to start their career in software development. Full training and mentorship provided — no prior work experience required.' },
  { company_id: companyB.id, title: 'Trainee Business Analyst', location: 'Bangalore',
    salary_min: 300000, salary_max: 450000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Excel', 'SQL', 'Communication'],
    description: 'One of the best Jobs for Freshers in the analytics space. We train you on the job — just bring your enthusiasm and willingness to learn.' },

  // Work from home Jobs
  { company_id: companyA.id, title: 'Remote Customer Support Associate', location: 'Remote',
    salary_min: 250000, salary_max: 400000, type: 'REMOTE', experience_level: 'JUNIOR',
    skills: ['Communication', 'CRM Tools', 'English'],
    description: 'Looking for talented people for our Work from home Jobs. Fully remote, flexible hours, laptop provided.' },
  { company_id: companyB.id, title: 'Remote Content Writer', location: 'Remote',
    salary_min: 280000, salary_max: 450000, type: 'REMOTE', experience_level: 'JUNIOR',
    skills: ['Content Writing', 'SEO', 'Research'],
    description: 'Explore our Work from home Jobs and write engaging content from anywhere in India. Flexible deadlines, async team.' },

  // Part time Jobs
  { company_id: companyA.id, title: 'Part-time Data Entry Operator', location: 'Mumbai',
    salary_min: 120000, salary_max: 200000, type: 'PART_TIME', experience_level: 'FRESHER',
    skills: ['MS Excel', 'Typing', 'Attention to Detail'],
    description: 'Flexible Part time Jobs for students and homemakers. Work just 4 hours a day, choose your own shift.' },
  { company_id: companyB.id, title: 'Part-time Telecaller', location: 'Delhi',
    salary_min: 150000, salary_max: 240000, type: 'PART_TIME', experience_level: 'JUNIOR',
    skills: ['Communication', 'Hindi', 'English'],
    description: 'Looking for candidates for our Part time Jobs in telecalling. Choose your own shift timing and work close to home.' },

  // Jobs for Women
  { company_id: companyA.id, title: 'HR Executive (Women Preferred)', location: 'Pune',
    salary_min: 450000, salary_max: 650000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['HR Operations', 'Recruitment', 'Communication'],
    description: 'We are proud to support Jobs for Women in the workplace, with flexible hours, safe transport, and a women-first culture.' },
  { company_id: companyB.id, title: 'Women Returnee Program - Marketing Associate', location: 'Bangalore',
    salary_min: 400000, salary_max: 600000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Marketing', 'Social Media', 'Communication'],
    description: 'Our diversity program offers Jobs for Women returning to the workforce after a career break, with mentorship and flexible onboarding.' },

  // Full time Jobs
  { company_id: companyA.id, title: 'Full Stack Developer', location: 'Pune',
    salary_min: 800000, salary_max: 1300000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    description: 'This is a Full time Jobs opportunity for engineers who want to grow with a fast-scaling product team.' },
  { company_id: companyB.id, title: 'Operations Executive', location: 'Bangalore',
    salary_min: 500000, salary_max: 750000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Operations', 'Vendor Management', 'Excel'],
    description: 'One of our top Full time Jobs in operations — manage vendor relationships and day-to-day logistics for a growing team.' },
];

console.log('\nInserting jobs...');
let inserted = 0, skipped = 0;
for (const job of JOBS) {
  const { data: ex } = await supabase.from('jobs')
    .select('id').eq('title', job.title).eq('company_id', job.company_id).single();
  if (ex) { skipped++; continue; }

  const { error } = await supabase.from('jobs').insert({
    id: randomUUID(), ...job, status: 'ACTIVE', vacancies: 2,
    expires_at: future, created_at: now, updated_at: now,
  });
  if (error) console.error(job.title, error.message);
  else { inserted++; console.log(`  ✓ ${job.title} @ ${job.location}`); }
}

console.log(`\nDone! ${inserted} jobs inserted, ${skipped} already existed.`);
console.log('Visit: http://localhost:3000/jobs?q=Jobs%20for%20Freshers\n');
