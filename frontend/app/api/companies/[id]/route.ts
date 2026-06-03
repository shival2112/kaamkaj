import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          where: { status: JobStatus.ACTIVE },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, title: true, location: true, type: true,
            salaryMin: true, salaryMax: true, skills: true,
            experienceLevel: true, createdAt: true,
            _count: { select: { applications: true } },
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('[GET /api/companies/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
