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

// Check auth.users (has user_metadata.role — what middleware reads)
const { data: authUsers } = await supabase.auth.admin.listUsers();
console.log('\n=== Supabase Auth Users (user_metadata) ===');
for (const u of authUsers?.users ?? []) {
  console.log(`  ${u.email.padEnd(30)} role=${u.user_metadata?.role ?? '(not set)'}  confirmed=${!!u.email_confirmed_at}`);
}

// Check public users table (what the app reads for profile)
const { data: dbUsers } = await supabase.from('users').select('email, role, name');
console.log('\n=== Public Users Table ===');
for (const u of dbUsers ?? []) {
  console.log(`  ${u.email.padEnd(30)} role=${u.role}  name=${u.name}`);
}
console.log('');
