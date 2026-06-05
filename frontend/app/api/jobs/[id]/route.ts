import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });

    // Treat DRAFT jobs as not-found for public access
    if (!job || job.status === 'DRAFT') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[GET /api/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
