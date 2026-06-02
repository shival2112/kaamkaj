/**
 * node scripts/seedAdmin.js
 *
 * Creates a superadmin user in Supabase Auth + Prisma DB.
 * Safe to run multiple times — checks for existence before creating.
 *
 * Required env vars (set in .env or export before running):
 *   SUPABASE_SERVICE_ROLE_KEY  — service-role key (not anon key)
 *   NEXT_PUBLIC_SUPABASE_URL   — your Supabase project URL
 *   DATABASE_URL               — Prisma connection string
 *   ADMIN_EMAIL                — email for the admin account
 *   ADMIN_PASSWORD             — password (min 6 chars)
 *   ADMIN_NAME                 — display name (default: "Admin")
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient }  = require('@prisma/client');

require('dotenv').config({ path: require('path').resolve(__dirname, '../frontend/.env.local') });

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL          = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD       = process.env.ADMIN_PASSWORD;
const ADMIN_NAME           = process.env.ADMIN_NAME ?? 'Admin';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 6) {
  console.error('Error: ADMIN_PASSWORD must be at least 6 characters.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const prisma = new PrismaClient();

async function seed() {
  console.log(`Seeding admin: ${ADMIN_EMAIL}`);

  // Check if admin already exists in Prisma DB
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    select: { id: true, role: true },
  });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log('Admin account already exists. Nothing to do.');
      return;
    }
    // Exists but wrong role — upgrade to ADMIN
    await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
    console.log('Existing user upgraded to ADMIN role.');
    return;
  }

  // Create in Supabase Auth (email_confirm: true — no confirmation email)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME, role: 'ADMIN' },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('exists')) {
      // Auth user exists but DB row missing — find and sync
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const authUser = listData?.users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      if (authUser) {
        await prisma.user.create({
          data: { id: authUser.id, email: ADMIN_EMAIL.toLowerCase(), name: ADMIN_NAME, role: 'ADMIN' },
        });
        await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
          user_metadata: { name: ADMIN_NAME, role: 'ADMIN' },
          email_confirm: true,
        });
        console.log('Admin synced from existing Supabase Auth user. Done.');
        return;
      }
    }
    console.error('Supabase Auth error:', error.message);
    process.exit(1);
  }

  if (!data.user) {
    console.error('Failed to create Supabase Auth user.');
    process.exit(1);
  }

  // Sync to Prisma DB
  await prisma.user.create({
    data: { id: data.user.id, email: ADMIN_EMAIL.toLowerCase(), name: ADMIN_NAME, role: 'ADMIN' },
  });

  console.log(`Admin created successfully! ID: ${data.user.id}`);
  console.log(`Login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

seed()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
