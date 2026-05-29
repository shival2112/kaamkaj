import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// ── 1. Confirm shival@gmail.com so they can log in ──────────────────────────
console.log('Confirming shival@gmail.com email...');
const { data: list } = await supabase.auth.admin.listUsers();
const shival = list?.users?.find(u => u.email === 'shival@gmail.com');
if (shival) {
  await supabase.auth.admin.updateUserById(shival.id, { email_confirm: true });
  console.log('  ✓ Email confirmed');
} else {
  console.log('  ! User not found');
}

// ── 2. Create a fresh confirmed employer account ────────────────────────────
console.log('\nCreating employer@kaamkaaj.com...');
const EMP_EMAIL = 'employer@kaamkaaj.com';
const EMP_PASS  = 'Employer@123#';
const EMP_NAME  = 'Test Employer';

const existing = list?.users?.find(u => u.email === EMP_EMAIL);
let empId;

if (existing) {
  console.log('  Already exists — reusing');
  empId = existing.id;
} else {
  const { data: emp, error } = await supabase.auth.admin.createUser({
    email: EMP_EMAIL,
    password: EMP_PASS,
    email_confirm: true,
    user_metadata: { name: EMP_NAME, role: 'EMPLOYER' },
  });
  if (error) { console.error('  Auth error:', error.message); process.exit(1); }
  empId = emp.user.id;
  console.log('  ✓ Auth user created:', empId);
}

const { error: dbErr } = await supabase.from('users').upsert(
  { id: empId, email: EMP_EMAIL, name: EMP_NAME, role: 'EMPLOYER', created_at: now, updated_at: now },
  { onConflict: 'id' }
);
if (dbErr) { console.error('  DB error:', dbErr.message); process.exit(1); }
console.log('  ✓ DB record upserted');

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`
╔══════════════════════════════════════════════╗
║           Test Credentials                  ║
╠══════════════════════════════════════════════╣
║  ADMIN                                       ║
║  Email   : admin@gmail.com                   ║
║  Password: Admin@123#                        ║
║  Goes to : /dashboard/admin                  ║
╠══════════════════════════════════════════════╣
║  EMPLOYER (existing Shival)                  ║
║  Email   : shival@gmail.com                  ║
║  Password: (whatever you set during signup)  ║
║  Goes to : /employer/dashboard               ║
╠══════════════════════════════════════════════╣
║  EMPLOYER (fresh test account)               ║
║  Email   : employer@kaamkaaj.com             ║
║  Password: Employer@123#                     ║
║  Goes to : /employer/dashboard               ║
╚══════════════════════════════════════════════╝
`);
