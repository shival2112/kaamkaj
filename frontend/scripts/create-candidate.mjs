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

const EMAIL = 'candidate@kaamkaaj.com';
const PASS  = 'Candidate@123#';
const NAME  = 'Test Candidate';
const now   = new Date().toISOString();

console.log('Creating candidate user...');

const { data: list } = await supabase.auth.admin.listUsers();
const existing = list?.users?.find(u => u.email === EMAIL);
let userId;

if (existing) {
  console.log('Auth user already exists — reusing');
  userId = existing.id;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASS,
    email_confirm: true,
    user_metadata: { name: NAME, role: 'CANDIDATE' },
  });
  if (error) { console.error('Auth error:', error.message); process.exit(1); }
  userId = data.user.id;
  console.log('Auth user created:', userId);
}

const { error: dbErr } = await supabase.from('users').upsert(
  { id: userId, email: EMAIL, name: NAME, role: 'CANDIDATE', created_at: now, updated_at: now },
  { onConflict: 'id' }
);
if (dbErr) { console.error('DB error:', dbErr.message); process.exit(1); }

console.log(`
╔══════════════════════════════════════════════╗
║         Candidate Test Account               ║
╠══════════════════════════════════════════════╣
║  Email   : candidate@kaamkaaj.com            ║
║  Password: Candidate@123#                    ║
║  Role    : CANDIDATE                         ║
║  Goes to : /dashboard                        ║
╚══════════════════════════════════════════════╝
`);
