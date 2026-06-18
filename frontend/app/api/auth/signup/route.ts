import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Role } from '@prisma/client';

// In-memory rate limit: max 10 signups per IP per hour
const signupAttempts = new Map<string, { count: number; windowStart: number }>();
const SIGNUP_LIMIT  = 10;
const WINDOW_MS     = 60 * 60 * 1000;

function checkSignupRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now   = Date.now();
  const entry = signupAttempts.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    signupAttempts.set(ip, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= SIGNUP_LIMIT) {
    const retryAfterSecs = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSecs };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';

    const { allowed, retryAfterSecs } = checkSignupRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many signup attempts. Please try again in ${Math.ceil(retryAfterSecs / 60)} minutes.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Limit': String(SIGNUP_LIMIT),
          },
        }
      );
    }

    const body = (await request.json()) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    const { id, email, name, role } = body;

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'id, email and name are required' },
        { status: 400 }
      );
    }

    const normalizedRole = role?.toUpperCase() as Role;
    const validRoles: Role[] = [Role.CANDIDATE, Role.EMPLOYER, Role.ADMIN];
    const userRole = validRoles.includes(normalizedRole)
      ? normalizedRole
      : Role.CANDIDATE;

    const user = await prisma.user.upsert({
      where: { id },
      update: { name, role: userRole },
      create: { id, email, name, role: userRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    // Auto-confirm the email so the user can log in immediately without
    // clicking a confirmation link (required for demo / dev environments
    // where Supabase email confirmation is enabled).
    await supabaseAdmin.auth.admin.updateUserById(id, {
      email_confirm: true,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[POST /api/auth/signup]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
