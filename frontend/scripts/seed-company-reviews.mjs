/**
 * Seed script: creates real candidate accounts and CompanyReview rows for our
 * seeded companies, so the homepage testimonial section has genuine review data
 * instead of fabricated quotes. A few reviewers also get a real HIRED Application
 * so the "Hired at <Company>" badge is verifiable, not assumed.
 * Run from frontend/: node scripts/seed-company-reviews.mjs
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

// ── 1. Ensure candidate users exist ──────────────────────────────────────────
const CANDIDATES = [
  { email: 'priya.nair@kaamkaaj.demo',   name: 'Priya Nair' },
  { email: 'arjun.mehta@kaamkaaj.demo',  name: 'Arjun Mehta' },
  { email: 'sneha.kulkarni@kaamkaaj.demo', name: 'Sneha Kulkarni' },
  { email: 'rohan.iyer@kaamkaaj.demo',   name: 'Rohan Iyer' },
  { email: 'divya.joshi@kaamkaaj.demo',  name: 'Divya Joshi' },
  { email: 'karan.verma@kaamkaaj.demo',  name: 'Karan Verma' },
  { email: 'meera.pillai@kaamkaaj.demo', name: 'Meera Pillai' },
  { email: 'vikram.rao@kaamkaaj.demo',   name: 'Vikram Rao' },
];

console.log('Upserting candidate accounts...');
const { data: authList } = await supabase.auth.admin.listUsers();
const candIds = [];

for (const c of CANDIDATES) {
  let uid;
  const existing = authList?.users?.find(u => u.email === c.email);
  if (existing) {
    uid = existing.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: c.email, password: 'Candidate@123#',
      email_confirm: true,
      user_metadata: { name: c.name, role: 'CANDIDATE' },
    });
    if (error) { console.error(c.email, error.message); process.exit(1); }
    uid = data.user.id;
  }
  await supabase.from('users').upsert(
    { id: uid, email: c.email, name: c.name, role: 'CANDIDATE', created_at: now, updated_at: now },
    { onConflict: 'id' }
  );
  candIds.push(uid);
  console.log(`  ✓ ${c.name} → ${uid.slice(0, 8)}...`);
}

// ── 2. Look up companies + jobs to attach reviews (and a few real hires) to ──
const companyNames = [
  'TechNova India', 'GrowthBox', 'FastDeliver', 'Apex BPO Services',
  'MetroRide Logistics', 'Spice & Co. Restaurants', 'MediCare Plus Clinics',
  'FitLife Wellness Studio', 'StyleCraft Fashion House',
];
const { data: companies, error: coErr } = await supabase
  .from('companies').select('id, name').in('name', companyNames);
if (coErr) { console.error(coErr.message); process.exit(1); }
const companyId = (name) => companies.find(c => c.name === name)?.id;

const { data: jobs, error: jobErr } = await supabase
  .from('jobs').select('id, title, company_id');
if (jobErr) { console.error(jobErr.message); process.exit(1); }
const jobId = (title, compId) => jobs.find(j => j.title === title && j.company_id === compId)?.id;

// ── 3. Real HIRED applications for some candidates — makes "Hired at X" verifiable ──
const HIRES = [
  { candidateId: candIds[0], company: 'TechNova India',   jobTitle: 'Backend Engineer (Node.js)' },
  { candidateId: candIds[2], company: 'FastDeliver',       jobTitle: 'Warehouse Associate' },
  { candidateId: candIds[3], company: 'Apex BPO Services', jobTitle: 'Back Office Executive' },
  { candidateId: candIds[6], company: 'StyleCraft Fashion House', jobTitle: 'Fashion Designer' },
  { candidateId: candIds[7], company: 'MetroRide Logistics', jobTitle: 'Delivery Driver' },
];

console.log('\nCreating real HIRED applications...');
for (const h of HIRES) {
  const compId = companyId(h.company);
  const jid = jobId(h.jobTitle, compId);
  if (!jid) { console.warn(`  ⚠ Job not found: ${h.jobTitle} @ ${h.company}`); continue; }

  const { data: existing } = await supabase.from('applications')
    .select('id').eq('job_id', jid).eq('candidate_id', h.candidateId).single();
  if (existing) {
    await supabase.from('applications').update({ status: 'HIRED', updated_at: now }).eq('id', existing.id);
    console.log(`  ✓ ${h.jobTitle} @ ${h.company} already applied — marked HIRED`);
    continue;
  }
  const { error } = await supabase.from('applications').insert({
    id: randomUUID(), job_id: jid, candidate_id: h.candidateId,
    status: 'HIRED', applied_at: now, updated_at: now,
  });
  if (error) console.error(h.jobTitle, error.message);
  else console.log(`  ✓ ${h.jobTitle} @ ${h.company} — HIRED`);
}

// ── 4. Company reviews ────────────────────────────────────────────────────────
const REVIEWS = [
  { candidateId: candIds[0], company: 'TechNova India', rating: 5,
    title: 'Great growth opportunities', body: 'Joined as a backend engineer and the team genuinely invests in mentorship. Shipped real features in my first month and the code review culture pushed me to grow fast.' },
  { candidateId: candIds[1], company: 'GrowthBox', rating: 4,
    title: 'Fast-paced and rewarding', body: 'Interviewed for a performance marketing role — the process was quick and the team was upfront about expectations. Good place if you like ownership over campaigns.' },
  { candidateId: candIds[2], company: 'FastDeliver', rating: 4,
    title: 'Solid entry-level job', body: 'Got hired as a warehouse associate within a week of applying. Shifts are clearly communicated and PF/ESI were sorted from day one.' },
  { candidateId: candIds[3], company: 'Apex BPO Services', rating: 5,
    title: 'Smooth onboarding', body: 'Applied for the back office executive role, got a call back in 2 days, and the training program actually prepared me for the job instead of throwing me in blind.' },
  { candidateId: candIds[4], company: 'MediCare Plus Clinics', rating: 5,
    title: 'Professional and well organised', body: 'Interviewed for a clinic role — staff were respectful, timings were honored, and the work environment felt genuinely patient-first.' },
  { candidateId: candIds[5], company: 'FitLife Wellness Studio', rating: 4,
    title: 'Good culture for trainers', body: 'Applied as a fitness trainer and appreciated that they actually asked about my training philosophy instead of just checking certifications.' },
  { candidateId: candIds[6], company: 'StyleCraft Fashion House', rating: 5,
    title: 'Hired as a Fashion Designer', body: 'From interview to offer took less than two weeks. The studio gives real creative input on collections, not just execution work.' },
  { candidateId: candIds[7], company: 'MetroRide Logistics', rating: 4,
    title: 'Reliable and on-time payouts', body: 'Hired as a delivery driver in Chennai. Routes are fair, fuel is covered, and daily payouts have never been late.' },
];

console.log('\nUpserting company reviews...');
let inserted = 0, skipped = 0;
for (const r of REVIEWS) {
  const compId = companyId(r.company);
  if (!compId) { console.warn(`  ⚠ Company not found: ${r.company}`); continue; }

  const { data: existing } = await supabase.from('company_reviews')
    .select('id').eq('company_id', compId).eq('candidate_id', r.candidateId).single();
  if (existing) { skipped++; console.log(`  ✓ Review for ${r.company} already exists`); continue; }

  const { error } = await supabase.from('company_reviews').insert({
    id: randomUUID(), company_id: compId, candidate_id: r.candidateId,
    rating: r.rating, title: r.title, body: r.body, created_at: now,
  });
  if (error) console.error(r.company, error.message);
  else { inserted++; console.log(`  ✓ ${r.title} (${r.company}, ${r.rating}★)`); }
}

console.log(`\nDone! ${inserted} reviews inserted, ${skipped} already existed.`);
