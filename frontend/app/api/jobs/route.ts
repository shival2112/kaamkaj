import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobStatus, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  // Non-blocking: auto-expire jobs whose expiresAt has passed
  prisma.job.updateMany({
    where: { status: JobStatus.ACTIVE, expiresAt: { lt: new Date() } },
    data:  { status: JobStatus.EXPIRED },
  }).catch(() => {});

  try {
    const { searchParams } = new URL(request.url);
    const q              = searchParams.get('q')?.trim() || undefined;
    const type           = searchParams.get('type')?.toUpperCase() as JobType | undefined;
    const location       = searchParams.get('location')?.trim() || undefined;
    const expLevel       = searchParams.get('experienceLevel')?.toUpperCase() as ExperienceLevel | undefined;
    const salaryMin      = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined;
    const salaryMax      = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined;
    const sort           = searchParams.get('sort') ?? 'newest';
    const page           = Math.max(1, Number(searchParams.get('page') || 1));

    const validTypes  = Object.values(JobType);
    const validLevels = Object.values(ExperienceLevel);
    const typeFilter  = type     && validTypes.includes(type)       ? type     : undefined;
    const levelFilter = expLevel && validLevels.includes(expLevel)  ? expLevel : undefined;

    const where = {
      status: JobStatus.ACTIVE,
      ...(q && {
        OR: [
          { title:       { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
          { skills:      { hasSome: [q] } },
        ],
      }),
      ...(location    && { location:         { contains: location, mode: 'insensitive' as const } }),
      ...(typeFilter  && { type: typeFilter }),
      ...(levelFilter && { experienceLevel: levelFilter }),
      ...((salaryMin || salaryMax) && {
        salaryMin: salaryMin ? { gte: salaryMin } : undefined,
        salaryMax: salaryMax ? { lte: salaryMax } : undefined,
      }),
    };

    const orderBy =
      sort === 'trending'    ? { viewCount: 'desc' as const } :
      sort === 'salary_desc' ? { salaryMax: 'desc' as const } :
      sort === 'salary_asc'  ? { salaryMin: 'asc'  as const } :
                               { createdAt: 'desc' as const };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { id: true, name: true, industry: true, isVerified: true } } },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('[GET /api/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
