import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Called by LoginForm before signInWithPassword.
// Confirms the Supabase email for the given address so login always works,
// even for accounts that were registered before auto-confirm was enabled.
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) return NextResponse.json({ ok: false });

    const normalizedEmail = email.toLowerCase().trim();

    // Fast path: look up user ID from our Prisma DB
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (dbUser) {
      await supabaseAdmin.auth.admin.updateUserById(dbUser.id, { email_confirm: true });
      return NextResponse.json({ ok: true });
    }

    // Slow path: user exists in Supabase Auth but the DB sync never ran.
    // Search Supabase Auth by email and confirm.
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authUser = data.users.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (authUser) {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, { email_confirm: true });

      // Also create the missing DB record so future lookups are fast
      const name = authUser.user_metadata?.name ?? normalizedEmail.split('@')[0] ?? 'User';
      const role = (authUser.user_metadata?.role as string)?.toUpperCase();
      const validRoles = ['CANDIDATE', 'EMPLOYER', 'ADMIN'];
      const userRole = validRoles.includes(role) ? role : 'CANDIDATE';

      await prisma.user.upsert({
        where: { id: authUser.id },
        update: {},
        create: { id: authUser.id, email: normalizedEmail, name, role: userRole as 'CANDIDATE' | 'EMPLOYER' | 'ADMIN' },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Non-fatal — let the login attempt proceed regardless
    return NextResponse.json({ ok: false });
  }
}
