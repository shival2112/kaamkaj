import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;



export async function GET(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim() || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const role = searchParams.get('role')?.trim().toUpperCase() as Role | undefined || undefined;

    const where = {
      ...(role ? { role } : {}),
      ...(q
        ? { OR: [
            { name:  { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ]}
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          isVerified: true, createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as {
      name?: string; email?: string; role?: string; password?: string;
    };
    const { name, email, role, password } = body;

    if (!name?.trim() || !email?.trim() || !role || !password) {
      return NextResponse.json({ error: 'name, email, role, and password are required' }, { status: 400 });
    }
    if (!['CANDIDATE', 'EMPLOYER'].includes(role)) {
      return NextResponse.json({ error: 'role must be CANDIDATE or EMPLOYER' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Create in Supabase Auth (auto-confirms email, no verification email sent)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: role.toLowerCase() },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create / sync the Prisma user record
    const newUser = await prisma.user.upsert({
      where: { id: authData.user.id },
      create: {
        id:           authData.user.id,
        email:        email.trim(),
        name:         name.trim(),
        role:         role as Role,
        isVerified:   true,
        emailVerified: true,
      },
      update: {
        name:         name.trim(),
        role:         role as Role,
        isVerified:   true,
        emailVerified: true,
      },
      select: {
        id: true, name: true, email: true, role: true,
        isVerified: true, createdAt: true,
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

