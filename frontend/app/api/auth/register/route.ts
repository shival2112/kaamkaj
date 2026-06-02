import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { sendEmail } from '@/lib/mailer';
import { welcomeEmailHtml } from '@/lib/emailTemplates/welcomeEmail';
import { verifyEmailHtml } from '@/lib/emailTemplates/verifyEmail';

// Server-side registration using the Supabase Admin API.
// This avoids the client-side signUp() flow which triggers confirmation emails
// and hits Supabase email rate limits.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      role: string;
    };

    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'email, password and name are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role?.toUpperCase() as Role;
    const validRoles: Role[] = [Role.CANDIDATE, Role.EMPLOYER];
    const userRole = validRoles.includes(normalizedRole) ? normalizedRole : Role.CANDIDATE;

    // Check if this email is already registered in our DB
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 });
    }

    // Create user directly in Supabase Auth (email_confirm: true → no email sent)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name, role: userRole },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already been registered') ||
          authError.message.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    const verificationToken = randomUUID();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Sync to Prisma DB with verification token
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email: normalizedEmail,
        name,
        role: userRole,
        emailVerified: false,
        verificationToken,
        verificationExpiry,
      },
    });

    // Send emails non-blocking — registration succeeds even if email fails
    Promise.all([
      sendEmail({ to: normalizedEmail, subject: 'Welcome to KaamKaaj!', html: welcomeEmailHtml(name) }),
      sendEmail({ to: normalizedEmail, subject: 'Verify your KaamKaaj email', html: verifyEmailHtml(name, verificationToken) }),
    ]).catch((err) => console.error('[register] email send failed:', err));

    return NextResponse.json({ ok: true, id: authData.user.id });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
