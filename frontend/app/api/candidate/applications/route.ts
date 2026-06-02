import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveCandidateUserId } from '@/lib/candidate-auth';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  try {
    const userId = await resolveCandidateUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Number(searchParams.get('limit') || PAGE_SIZE));

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { candidateId: userId },
        include: {
          job: {
            include: { company: { select: { name: true, industry: true } } },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where: { candidateId: userId } }),
    ]);

    console.log('[GET /api/candidate/applications] userId:', userId, '→', total, 'total applications');
    return NextResponse.json({ applications, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/candidate/applications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
