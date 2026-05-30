import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    const [saved, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId: user.id },
        include: {
          job: {
            include: { company: { select: { name: true, industry: true } } },
          },
        },
        orderBy: { savedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.savedJob.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      saved,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('[GET /api/candidate/saved]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
