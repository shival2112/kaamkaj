import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (dbUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim() || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    const where = {
      role: 'CANDIDATE' as const,
      ...(q ? { OR: [
        { name:  { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ]} : {}),
    };

    const [candidates, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, avatar: true,
          phone: true, isVerified: true, createdAt: true,
          _count: { select: { applications: true } },
          resume: { select: { fileUrl: true, parsedData: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ candidates, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/candidates]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
