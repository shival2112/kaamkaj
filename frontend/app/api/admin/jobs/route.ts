import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, unauth: true };
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return { admin: dbUser?.role === 'ADMIN' ? user : null, unauth: false };
}

export async function GET(request: Request) {
  try {
    const { admin, unauth } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: unauth ? 'Unauthorized' : 'Forbidden' }, { status: unauth ? 401 : 403 });

    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim() || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    const where = q
      ? {
          OR: [
            { title:    { contains: q, mode: 'insensitive' as const } },
            { location: { contains: q, mode: 'insensitive' as const } },
            { company:  { name: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { name: true } },
          _count:  { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
