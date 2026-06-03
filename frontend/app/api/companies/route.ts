import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q        = searchParams.get('q')?.trim() || undefined;
    const industry = searchParams.get('industry')?.trim() || undefined;
    const size     = searchParams.get('size')?.trim() || undefined;
    const page     = Math.max(1, Number(searchParams.get('page') || 1));

    const where = {
      ...(q        && { name:     { contains: q,        mode: 'insensitive' as const } }),
      ...(industry && { industry: { contains: industry, mode: 'insensitive' as const } }),
      ...(size     && { size }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: { jobs: { where: { status: JobStatus.ACTIVE } } },
          },
        },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('[GET /api/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
