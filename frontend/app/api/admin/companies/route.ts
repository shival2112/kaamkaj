import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return dbUser?.role === 'ADMIN' ? user : null;
}

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim() || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    const where = q
      ? { OR: [
          { name:     { contains: q, mode: 'insensitive' as const } },
          { industry: { contains: q, mode: 'insensitive' as const } },
        ]}
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          owner:  { select: { name: true, email: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({ companies, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — toggle isVerified
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as { id: string; isVerified: boolean };
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.company.update({
      where: { id: body.id },
      data:  { isVerified: body.isVerified },
      select: { id: true, isVerified: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove a company (cascades jobs + applications)
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
