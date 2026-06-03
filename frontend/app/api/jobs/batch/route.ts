import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get('ids') ?? '';
    const ids = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10);

    if (ids.length === 0) return NextResponse.json({ jobs: [] });

    const jobs = await prisma.job.findMany({
      where: { id: { in: ids }, status: JobStatus.ACTIVE },
      include: { company: { select: { id: true, name: true, industry: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Preserve localStorage order
    const ordered = ids
      .map(id => jobs.find(j => j.id === id))
      .filter(Boolean);

    return NextResponse.json({ jobs: ordered });
  } catch (error) {
    console.error('[GET /api/jobs/batch]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
