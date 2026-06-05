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
          { title:   { contains: q, mode: 'insensitive' as const } },
          { company: { name: { contains: q, mode: 'insensitive' as const } } },
          { candidate: { name: { contains: q, mode: 'insensitive' as const } } },
        ]}
      : {};

    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where,
        include: {
          company:   { select: { id: true, name: true } },
          candidate: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.companyReview.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — admin removes a specific review by ID
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.companyReview.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
