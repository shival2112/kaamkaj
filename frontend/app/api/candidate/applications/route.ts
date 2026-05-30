import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Number(searchParams.get('limit') || PAGE_SIZE));

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { candidateId: user.id },
        include: {
          job: {
            include: { company: { select: { name: true, industry: true } } },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where: { candidateId: user.id } }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/candidate/applications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
