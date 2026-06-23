import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyAdmin } from '@/lib/admin-auth';
import { Role } from '@prisma/client';
import { checkRateLimit, rateLimitResponseInit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const RESET_LIMIT = 3;
const RESET_WINDOW_MS = 60 * 60 * 1000; // 1 hour, per target user

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        resume:       { select: { fileUrl: true, parsedData: true, createdAt: true } },
        company:      { select: { id: true, name: true, industry: true } },
        applications: {
          orderBy: { appliedAt: 'desc' },
          take: 10,
          select: {
            id: true, status: true, appliedAt: true,
            job: { select: { id: true, title: true } },
          },
        },
        _count: { select: { applications: true, savedJobs: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET /api/admin/users/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Prevent admin from suspending themselves
    if (params.id === admin.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 });
    }

    const body = await request.json() as {
      action: 'suspend' | 'restore' | 'changeRole' | 'sendPasswordReset';
      role?: string;
    };

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // ── Change Role ────────────────────────────────────────────────────────────
    if (body.action === 'changeRole') {
      const validRoles: string[] = ['CANDIDATE', 'EMPLOYER'];
      if (!body.role || !validRoles.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role. Must be CANDIDATE or EMPLOYER.' }, { status: 400 });
      }
      if (target.role === 'ADMIN') {
        return NextResponse.json({ error: 'Cannot change an admin account role' }, { status: 400 });
      }
      const updated = await prisma.user.update({
        where: { id: params.id },
        data:  { role: body.role as Role },
        select: { id: true, role: true },
      });
      return NextResponse.json(updated);
    }

    // ── Send Password Reset ────────────────────────────────────────────────────
    if (body.action === 'sendPasswordReset') {
      if (target.email.includes('@phone.kaamkaaj.internal')) {
        return NextResponse.json({ error: 'Phone-auth users cannot receive password reset emails' }, { status: 400 });
      }
      const { allowed, retryAfterSecs } = checkRateLimit(`admin-pw-reset:${params.id}`, RESET_LIMIT, RESET_WINDOW_MS);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Too many password reset emails sent to this user recently. Please wait before retrying.' },
          rateLimitResponseInit(retryAfterSecs, RESET_LIMIT)
        );
      }
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(target.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    // ── Suspend / Restore ──────────────────────────────────────────────────────
    if (body.action !== 'suspend' && body.action !== 'restore') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (target.role === 'ADMIN' && body.action === 'suspend') {
      return NextResponse.json({ error: 'Cannot suspend an admin account' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { isVerified: body.action === 'restore' },
      select: { id: true, isVerified: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/users/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (params.id === admin.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (target.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete an admin account' }, { status: 400 });
    }

    // Delete from Prisma (cascades to applications, saved jobs, resume)
    await prisma.user.delete({ where: { id: params.id } });

    // Delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(params.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/users/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
