/**
 * Seed script: creates 3 companies + 15 jobs.
 * Run from frontend/: node scripts/seed-jobs.mjs
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

// ── 1. Ensure 3 employer users exist ─────────────────────────────────────────
const EMPLOYERS = [
  { email: 'employer@kaamkaaj.com', name: 'TechNova HR',     role: 'EMPLOYER' },
  { email: 'emp2@kaamkaaj.com',     name: 'GrowthBox HR',    role: 'EMPLOYER' },
  { email: 'emp3@kaamkaaj.com',     name: 'FastDeliver HR',  role: 'EMPLOYER' },
];

console.log('Upserting employer accounts...');
const { data: authList } = await supabase.auth.admin.listUsers();
const empIds = [];

for (const emp of EMPLOYERS) {
  let uid;
  const existing = authList?.users?.find(u => u.email === emp.email);
  if (existing) {
    uid = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: emp.email, password: 'Employer@123#',
      email_confirm: true,
      user_metadata: { name: emp.name, role: emp.role },
    });
    if (error) { console.error(emp.email, error.message); process.exit(1); }
    uid = data.user.id;
  }
  await supabase.from('users').upsert(
    { id: uid, email: emp.email, name: emp.name, role: emp.role, created_at: now, updated_at: now },
    { onConflict: 'id' }
  );
  empIds.push(uid);
  console.log(`  ✓ ${emp.email} → ${uid.slice(0, 8)}...`);
}

// ── 2. Create companies ───────────────────────────────────────────────────────
const COMPANIES = [
  { name: 'TechNova India',   industry: 'Technology',         size: '201-500', ownerId: empIds[0],
    description: 'Building next-gen SaaS products for India and beyond.' },
  { name: 'GrowthBox',        industry: 'Marketing & Media',  size: '11-50',   ownerId: empIds[1],
    description: 'A growth-focused agency helping startups scale their reach.' },
  { name: 'FastDeliver',      industry: 'Logistics & Supply Chain', size: '501+', ownerId: empIds[2],
    description: 'India\'s fastest last-mile delivery network across 300+ cities.' },
];

console.log('\nUpserting companies...');
const companyIds = [];
for (const co of COMPANIES) {
  const { data: existing } = await supabase.from('companies').select('id').eq('owner_id', co.ownerId).single();
  if (existing) {
    companyIds.push(existing.id);
    console.log(`  ✓ ${co.name} already exists`);
    continue;
  }
  const { data, error } = await supabase.from('companies').insert({
    id: randomUUID(),
    name: co.name, industry: co.industry, size: co.size, owner_id: co.ownerId,
    description: co.description, is_verified: true, created_at: now, updated_at: now,
  }).select('id').single();
  if (error) { console.error(co.name, error.message); process.exit(1); }
  companyIds.push(data.id);
  console.log(`  ✓ ${co.name} → ${data.id.slice(0, 8)}...`);
}

// ── 3. Create jobs ────────────────────────────────────────────────────────────
const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const JOBS = [
  // TechNova India
  { company_id: companyIds[0], title: 'Senior React Developer', location: 'Bangalore',
    salary_min: 1200000, salary_max: 1800000, type: 'FULL_TIME', experience_level: 'SENIOR',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    description: 'We are looking for a Senior React Developer to lead frontend development of our flagship SaaS product. You will architect scalable UI components, mentor junior developers, and collaborate closely with product and design teams.' },
  { company_id: companyIds[0], title: 'Backend Engineer (Node.js)', location: 'Bangalore',
    salary_min: 800000, salary_max: 1400000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    description: 'Join our backend team to build high-performance APIs and microservices. You will work on real-time features, optimize database queries, and ensure system reliability at scale.' },
  { company_id: companyIds[0], title: 'DevOps Engineer', location: 'Hyderabad',
    salary_min: 900000, salary_max: 1500000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    description: 'Own our cloud infrastructure on AWS. You will design deployment pipelines, manage Kubernetes clusters, and drive our DevSecOps practices.' },
  { company_id: companyIds[0], title: 'Product Manager', location: 'Bangalore',
    salary_min: 1500000, salary_max: 2500000, type: 'FULL_TIME', experience_level: 'SENIOR',
    skills: ['Product Strategy', 'Agile', 'SQL', 'Figma'],
    description: 'Define the roadmap for our core product. You will work with engineering, design, and sales to deliver features that delight customers and drive growth.' },
  { company_id: companyIds[0], title: 'React Native Intern', location: 'Remote',
    salary_min: 180000, salary_max: 240000, type: 'INTERNSHIP', experience_level: 'FRESHER',
    skills: ['React Native', 'JavaScript', 'REST APIs'],
    description: 'A 6-month paid internship to build mobile features for our candidate-facing app. Great opportunity to learn from a senior engineering team.' },

  // GrowthBox
  { company_id: companyIds[1], title: 'SEO & Content Specialist', location: 'Mumbai',
    salary_min: 400000, salary_max: 700000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['SEO', 'Content Writing', 'WordPress', 'Google Analytics'],
    description: 'Drive organic growth for our clients through well-researched content and on-page SEO. You will manage content calendars, conduct keyword research, and report on performance weekly.' },
  { company_id: companyIds[1], title: 'Performance Marketing Manager', location: 'Mumbai',
    salary_min: 800000, salary_max: 1200000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Google Ads', 'Meta Ads', 'Analytics', 'A/B Testing'],
    description: 'Manage paid acquisition campaigns across Google and Meta for a portfolio of 10+ brands. You will own budgets, optimize ROAS, and build scalable campaign structures.' },
  { company_id: companyIds[1], title: 'Graphic Designer', location: 'Remote',
    salary_min: 350000, salary_max: 600000, type: 'REMOTE', experience_level: 'JUNIOR',
    skills: ['Figma', 'Adobe Photoshop', 'Illustrator', 'Motion Design'],
    description: 'Create compelling visual content — social media graphics, brand kits, and ad creatives — for fast-growing D2C brands in our portfolio.' },
  { company_id: companyIds[1], title: 'Brand Manager', location: 'Delhi',
    salary_min: 1000000, salary_max: 1600000, type: 'FULL_TIME', experience_level: 'SENIOR',
    skills: ['Brand Strategy', 'Market Research', 'Campaign Management'],
    description: 'Lead brand strategy for a key account. You will oversee positioning, messaging, and integrated campaigns from brief to execution.' },
  { company_id: companyIds[1], title: 'Copywriter (Part-time)', location: 'Remote',
    salary_min: 200000, salary_max: 360000, type: 'PART_TIME', experience_level: 'JUNIOR',
    skills: ['Copywriting', 'Email Marketing', 'Social Media'],
    description: 'Write conversion-focused copy for email campaigns, landing pages, and social ads. Flexible hours — 20 hrs/week. Perfect for a freelancer looking for a retainer.' },

  // FastDeliver
  { company_id: companyIds[2], title: 'Delivery Executive', location: 'Pune',
    salary_min: 240000, salary_max: 360000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Bike Riding', 'Navigation', 'Customer Service'],
    description: 'Deliver packages across your assigned zone with a smile. We provide the bike, fuel, and training. Daily payout available. No experience required — just a valid DL.' },
  { company_id: companyIds[2], title: 'Delivery Executive', location: 'Bangalore',
    salary_min: 240000, salary_max: 360000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Bike Riding', 'Navigation', 'Customer Service'],
    description: 'Join our Bangalore delivery fleet. Zone-based assignments, flexible shifts, and incentives for on-time delivery. 2-wheeler required.' },
  { company_id: companyIds[2], title: 'Warehouse Associate', location: 'Mumbai',
    salary_min: 200000, salary_max: 300000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Inventory Management', 'Forklift (preferred)', 'MS Excel'],
    description: 'Sort, pack, and dispatch packages at our Mumbai fulfilment centre. Night shift and day shift available. PF + ESI + meals included.' },
  { company_id: companyIds[2], title: 'Fleet Operations Manager', location: 'Hyderabad',
    salary_min: 600000, salary_max: 900000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Fleet Management', 'Logistics', 'Team Leadership', 'Excel'],
    description: 'Oversee a fleet of 200+ delivery partners across Hyderabad. You will handle routing, performance tracking, partner grievances, and hub-level targets.' },
  { company_id: companyIds[2], title: 'Customer Support Executive', location: 'Delhi',
    salary_min: 280000, salary_max: 420000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Communication', 'CRM Tools', 'Hindi', 'English'],
    description: 'Handle inbound delivery queries via chat, email, and phone. Rotational shifts. Training provided. Great entry point into India\'s logistics sector.' },
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
  if (error) { console.error(job.title, error.message); }
  else { inserted++; console.log(`  ✓ ${job.title} @ ${job.location}`); }
}

console.log(`\nDone! ${inserted} jobs inserted, ${skipped} already existed.`);
console.log('Visit: http://localhost:3000/jobs\n');
