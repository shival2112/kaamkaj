import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET — list recruiters for this employer's company
export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });
    if (!company) return NextResponse.json({ recruiters: [] });

    const recruiters = await prisma.user.findMany({
      where: { recruiterCompanyId: company.id, role: 'RECRUITER' },
      select: {
        id: true, name: true, email: true,
        isVerified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ recruiters });
  } catch (error) {
    console.error('[GET /api/employer/recruiters]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — create a recruiter linked to this employer's company
export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'Create your company profile first' }, { status: 400 });

    const body = await request.json() as { name?: string; email?: string; password?: string };
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'name, email, and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: 'recruiter' },
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const recruiter = await prisma.user.upsert({
      where:  { id: authData.user.id },
      create: {
        id:                authData.user.id,
        email:             email.trim(),
        name:              name.trim(),
        role:              'RECRUITER',
        isVerified:        true,
        emailVerified:     true,
        recruiterCompanyId: company.id,
      },
      update: {
        name:              name.trim(),
        role:              'RECRUITER',
        isVerified:        true,
        recruiterCompanyId: company.id,
      },
      select: { id: true, name: true, email: true, isVerified: true, createdAt: true },
    });

    return NextResponse.json(recruiter, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/recruiters]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove a recruiter (must belong to this employer's company)
export async function DELETE(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId }, select: { id: true } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const recruiterId = searchParams.get('id');
    if (!recruiterId) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const recruiter = await prisma.user.findUnique({
      where: { id: recruiterId },
      select: { role: true, recruiterCompanyId: true },
    });
    if (!recruiter || recruiter.role !== 'RECRUITER' || recruiter.recruiterCompanyId !== company.id) {
      return NextResponse.json({ error: 'Recruiter not found in your company' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: recruiterId } });
    await supabaseAdmin.auth.admin.deleteUser(recruiterId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/employer/recruiters]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
