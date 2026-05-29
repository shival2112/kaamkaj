/**
 * One-time script: creates the admin user in Supabase Auth + public users table.
 * Run from frontend/: node scripts/create-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv needed)
const envPath = resolve(__dirname, '../.env.local');
const envLines = readFileSync(envPath, 'utf8').split('\n');
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Service role client — bypasses RLS, can create users
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123#';
const ADMIN_NAME = 'Admin';

async function main() {
  console.log('Creating admin in Supabase Auth...');

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,          // skip email verification
      user_metadata: {
        name: ADMIN_NAME,
        role: 'ADMIN',
      },
    });

  if (authError) {
    // If user already exists, fetch them instead
    if (authError.message.includes('already been registered')) {
      console.log('Auth user already exists — fetching existing user...');
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
      if (!existing) {
        console.error('Could not find existing auth user:', authError.message);
        process.exit(1);
      }
      await upsertPublicUser(existing.id);
      return;
    }
    console.error('Auth error:', authError.message);
    process.exit(1);
  }

  console.log('Auth user created:', authData.user.id);
  await upsertPublicUser(authData.user.id);
}

async function upsertPublicUser(id) {
  console.log('Upserting into public users table...');

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('users')
    .upsert(
      { id, email: ADMIN_EMAIL, name: ADMIN_NAME, role: 'ADMIN', created_at: now, updated_at: now },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('DB upsert error:', error.message);
    process.exit(1);
  }

  console.log('');
  console.log('Admin created successfully!');
  console.log('  Email   :', ADMIN_EMAIL);
  console.log('  Password:', ADMIN_PASSWORD);
  console.log('  Role    : ADMIN');
  console.log('');
  console.log('Login at: http://localhost:3000/auth/login');
}

main();
