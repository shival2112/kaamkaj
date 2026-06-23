/**
 * Seed script: adds companies + jobs that match the homepage "Trending job roles"
 * categories (Back Office, Driver, Cook/Chef/Baker, Doctor/Dentist, etc.) so the
 * real DB-driven counts on app/page.tsx are non-zero.
 * Run from frontend/: node scripts/seed-trending-roles.mjs
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
const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

// ── 1. Ensure employer users exist ───────────────────────────────────────────
const EMPLOYERS = [
  { email: 'hr@apexbpo.kaamkaaj.com',     name: 'Apex BPO HR',         role: 'EMPLOYER' },
  { email: 'hr@metroride.kaamkaaj.com',   name: 'MetroRide HR',        role: 'EMPLOYER' },
  { email: 'hr@spiceandco.kaamkaaj.com',  name: 'Spice & Co. HR',      role: 'EMPLOYER' },
  { email: 'hr@medicareplus.kaamkaaj.com',name: 'MediCare Plus HR',    role: 'EMPLOYER' },
  { email: 'hr@fitlife.kaamkaaj.com',     name: 'FitLife Wellness HR', role: 'EMPLOYER' },
  { email: 'hr@stylecraft.kaamkaaj.com',  name: 'StyleCraft HR',       role: 'EMPLOYER' },
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
  { name: 'Apex BPO Services',       industry: 'BPO & Back Office',  size: '201-500', ownerId: empIds[0],
    description: 'Back-office processing, business operations, and HR support for 50+ enterprise clients across India.' },
  { name: 'MetroRide Logistics',     industry: 'Logistics & Supply Chain', size: '501+', ownerId: empIds[1],
    description: 'Urban fleet and driver network powering same-day delivery across 40+ Indian cities.' },
  { name: 'Spice & Co. Restaurants', industry: 'Hospitality & Food Services', size: '51-200', ownerId: empIds[2],
    description: 'A growing chain of restaurants and bakeries known for fresh, quality food across North India.' },
  { name: 'MediCare Plus Clinics',   industry: 'Healthcare',         size: '51-200', ownerId: empIds[3],
    description: 'Multi-speciality outpatient clinics providing primary care, dental, and diagnostic services.' },
  { name: 'FitLife Wellness Studio', industry: 'Health & Fitness',   size: '11-50',  ownerId: empIds[4],
    description: 'Boutique fitness studios offering personal training, group classes, and nutrition coaching.' },
  { name: 'StyleCraft Fashion House',industry: 'Fashion & Apparel',  size: '11-50',  ownerId: empIds[5],
    description: 'A custom tailoring and fashion design studio serving retail and bespoke clients.' },
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

// ── 3. Create jobs — titles/skills deliberately match the homepage trending categories ──
const JOBS = [
  // Apex BPO Services → Back Office, Business Operations, Human Resource
  { company_id: companyIds[0], title: 'Back Office Executive', location: 'Noida',
    salary_min: 220000, salary_max: 360000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['MS Excel', 'Data Entry', 'Back Office', 'Email Management'],
    description: 'Handle data entry, documentation, and back office support for enterprise clients. Freshers welcome, training provided.' },
  { company_id: companyIds[0], title: 'Business Operations Associate', location: 'Gurugram',
    salary_min: 350000, salary_max: 550000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Business Operations', 'Process Improvement', 'Reporting', 'MS Excel'],
    description: 'Support daily business operations, track process metrics, and assist in operational reporting for client accounts.' },
  { company_id: companyIds[0], title: 'Human Resource Executive', location: 'Noida',
    salary_min: 300000, salary_max: 480000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Human Resource', 'Recruitment', 'Onboarding', 'Payroll'],
    description: 'Manage recruitment, onboarding, and employee engagement for a growing back-office workforce.' },

  // MetroRide Logistics → Driver
  { company_id: companyIds[1], title: 'Delivery Driver', location: 'Chennai',
    salary_min: 240000, salary_max: 360000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Driving', 'Navigation', 'Customer Service'],
    description: 'Drive assigned routes for daily package deliveries. Valid driving licence required. Daily payout available.' },
  { company_id: companyIds[1], title: 'Delivery Driver', location: 'Kolkata',
    salary_min: 240000, salary_max: 360000, type: 'FULL_TIME', experience_level: 'FRESHER',
    skills: ['Driving', 'Navigation', 'Customer Service'],
    description: 'Join our Kolkata fleet for zone-based delivery routes. Vehicle and fuel provided, flexible shifts.' },

  // Spice & Co. Restaurants → Cook / Chef / Baker
  { company_id: companyIds[2], title: 'Cook', location: 'Lucknow',
    salary_min: 200000, salary_max: 320000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Cooking', 'Food Preparation', 'Kitchen Hygiene'],
    description: 'Prepare daily menu items following standard recipes and hygiene practices in a busy restaurant kitchen.' },
  { company_id: companyIds[2], title: 'Chef de Partie', location: 'Lucknow',
    salary_min: 350000, salary_max: 550000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Culinary Arts', 'Menu Planning', 'Team Leadership'],
    description: 'Own a section of the kitchen, manage a small team of cooks, and ensure consistent quality and plating standards.' },
  { company_id: companyIds[2], title: 'Baker', location: 'Lucknow',
    salary_min: 220000, salary_max: 340000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Baking', 'Pastry', 'Food Safety'],
    description: 'Bake breads, pastries, and desserts for our bakery counter. Early morning shift, experience with commercial ovens preferred.' },

  // MediCare Plus Clinics → Doctor / Dentist, Medical Executive / Assistant
  { company_id: companyIds[3], title: 'Doctor - General Physician', location: 'Pune',
    salary_min: 900000, salary_max: 1800000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['General Medicine', 'Patient Care', 'Diagnosis'],
    description: 'Provide outpatient consultations and primary care to patients across our clinic network. MBBS required, MD preferred.' },
  { company_id: companyIds[3], title: 'Dentist', location: 'Pune',
    salary_min: 700000, salary_max: 1400000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Dental Care', 'Oral Surgery', 'Patient Management'],
    description: 'Perform routine dental check-ups, cleanings, and minor procedures. BDS required, clinic experience preferred.' },
  { company_id: companyIds[3], title: 'Medical Executive', location: 'Pune',
    salary_min: 300000, salary_max: 480000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Patient Coordination', 'Medical Records', 'Front Desk'],
    description: 'Coordinate patient appointments, maintain medical records, and support doctors with administrative tasks at the clinic front desk.' },

  // FitLife Wellness Studio → Fitness Trainer / Dietician
  { company_id: companyIds[4], title: 'Fitness Trainer', location: 'Bangalore',
    salary_min: 280000, salary_max: 500000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Personal Training', 'Strength Training', 'Client Coaching'],
    description: 'Design and lead personal training sessions and group fitness classes for studio members of all fitness levels.' },
  { company_id: companyIds[4], title: 'Dietician', location: 'Bangalore',
    salary_min: 320000, salary_max: 560000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Nutrition Planning', 'Diet Counselling', 'Client Coaching'],
    description: 'Create personalised diet plans and provide nutrition counselling for studio clients pursuing fitness and weight goals.' },

  // StyleCraft Fashion House → Tailor / Cutting Master, Fashion Designer
  { company_id: companyIds[5], title: 'Tailor', location: 'Surat',
    salary_min: 200000, salary_max: 340000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Stitching', 'Garment Fitting', 'Hand Embroidery'],
    description: 'Stitch and alter garments to customer measurements for our bespoke tailoring line. Experience with ethnic and formal wear preferred.' },
  { company_id: companyIds[5], title: 'Cutting Master', location: 'Surat',
    salary_min: 280000, salary_max: 420000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Pattern Making', 'Fabric Cutting', 'Quality Control'],
    description: 'Lead fabric cutting and pattern-making for bulk and bespoke orders, ensuring minimal wastage and consistent fit.' },
  { company_id: companyIds[5], title: 'Fashion Designer', location: 'Mumbai',
    salary_min: 450000, salary_max: 800000, type: 'FULL_TIME', experience_level: 'MID',
    skills: ['Fashion Design', 'Sketching', 'Trend Research', 'Adobe Illustrator'],
    description: 'Design seasonal collections from concept sketches through to final samples, working closely with our tailoring and production teams.' },
];

console.log('\nInserting jobs...');
let inserted = 0, skipped = 0;
for (const job of JOBS) {
  const { data: ex } = await supabase.from('jobs')
    .select('id').eq('title', job.title).eq('company_id', job.company_id).eq('location', job.location).single();
  if (ex) { skipped++; continue; }

  const { error } = await supabase.from('jobs').insert({
    id: randomUUID(), ...job, status: 'ACTIVE', vacancies: 2,
    expires_at: future, created_at: now, updated_at: now,
  });
  if (error) { console.error(job.title, error.message); }
  else { inserted++; console.log(`  ✓ ${job.title} @ ${job.location}`); }
}

// ── 4. Add a Digital Marketing job to the existing GrowthBox company ─────────
console.log('\nAdding Digital Marketing role to GrowthBox...');
const { data: growthBox } = await supabase.from('companies').select('id').eq('name', 'GrowthBox').single();
if (growthBox) {
  const digitalJob = {
    company_id: growthBox.id, title: 'Digital Marketing Executive', location: 'Mumbai',
    salary_min: 300000, salary_max: 500000, type: 'FULL_TIME', experience_level: 'JUNIOR',
    skills: ['Digital Marketing', 'Online Marketing', 'SEO', 'Social Media'],
    description: 'Plan and execute digital and online marketing campaigns across search, social, and email for our client portfolio.',
  };
  const { data: ex } = await supabase.from('jobs')
    .select('id').eq('title', digitalJob.title).eq('company_id', digitalJob.company_id).single();
  if (ex) {
    skipped++;
    console.log('  ✓ Digital Marketing Executive already exists');
  } else {
    const { error } = await supabase.from('jobs').insert({
      id: randomUUID(), ...digitalJob, status: 'ACTIVE', vacancies: 2,
      expires_at: future, created_at: now, updated_at: now,
    });
    if (error) console.error('Digital Marketing Executive', error.message);
    else { inserted++; console.log('  ✓ Digital Marketing Executive @ Mumbai'); }
  }
} else {
  console.warn('  ⚠ GrowthBox company not found — skipping Digital Marketing role');
}

console.log(`\nDone! ${inserted} jobs inserted, ${skipped} already existed.`);
console.log('Visit: http://localhost:3000/jobs\n');
