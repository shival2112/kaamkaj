import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobStatus } from '@prisma/client';

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q        = searchParams.get('q')?.trim() || undefined;
    const type     = searchParams.get('type')?.toUpperCase() as JobType | undefined;
    const location = searchParams.get('location')?.trim() || undefined;
    const salaryMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined;
    const salaryMax = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined;
    const page      = Math.max(1, Number(searchParams.get('page') || 1));

    const validTypes = Object.values(JobType);
    const typeFilter = type && validTypes.includes(type) ? type : undefined;

    const where = {
      status: JobStatus.ACTIVE,
      ...(q        && { title:    { contains: q,        mode: 'insensitive' as const } }),
      ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(typeFilter && { type: typeFilter }),
      ...((salaryMin || salaryMax) && {
        salaryMin: salaryMin ? { gte: salaryMin } : undefined,
        salaryMax: salaryMax ? { lte: salaryMax } : undefined,
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { id: true, name: true, industry: true, isVerified: true } } },
        orderBy: { createdAt: 'desc' },
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
