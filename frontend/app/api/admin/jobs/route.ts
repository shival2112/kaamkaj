import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { Prisma, JobType, JobStatus, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q             = searchParams.get('q')?.trim() || undefined;
    const page          = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize      = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') || 20)));
    const typeParam     = searchParams.get('type')?.toUpperCase();
    const statusParam   = searchParams.get('status')?.toUpperCase();
    const sortParam     = searchParams.get('sort') ?? 'date';
    const orderParam    = searchParams.get('order') === 'asc' ? 'asc' : 'desc' as const;
    const expParam      = searchParams.get('exp')?.toUpperCase();
    const daysParam     = Number(searchParams.get('days') || 0);
    const urgentParam   = searchParams.get('urgent') === 'true';
    const reportedParam = searchParams.get('reported') === 'true';

    const validTypes     = Object.values(JobType);
    const validStatuses  = Object.values(JobStatus);
    const validExpLevels = Object.values(ExperienceLevel);
    const typeFilter   = typeParam   && validTypes.includes(typeParam as JobType)             ? (typeParam as JobType)         : undefined;
    const statusFilter = statusParam && validStatuses.includes(statusParam as JobStatus)       ? (statusParam as JobStatus)     : undefined;
    const expFilter    = expParam    && validExpLevels.includes(expParam as ExperienceLevel)   ? (expParam as ExperienceLevel)  : undefined;

    const where: Prisma.JobWhereInput = {
      ...(statusFilter           && { status:          statusFilter }),
      ...(typeFilter             && { type:            typeFilter }),
      ...(expFilter              && { experienceLevel: expFilter }),
      ...(urgentParam            && { isUrgent:        true }),
      ...(reportedParam          && { reports:         { some: {} } }),
      ...(daysParam > 0          && { createdAt:       { gte: new Date(Date.now() - daysParam * 86400000) } }),
      ...(q && {
        OR: [
          { title:    { contains: q, mode: 'insensitive' as const } },
          { location: { contains: q, mode: 'insensitive' as const } },
          { company:  { name: { contains: q, mode: 'insensitive' as const } } },
        ],
      }),
    };

    let orderBy: Prisma.JobOrderByWithRelationInput;
    if (sortParam === 'views')     orderBy = { viewCount:    orderParam };
    else if (sortParam === 'apps') orderBy = { applications: { _count: orderParam } };
    else                           orderBy = { createdAt:    orderParam };

    const [jobs, total, statusGroups, reportedCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { name: true, industry: true } },
          _count:  { select: { applications: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.job.count({ where }),
      prisma.job.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.job.count({ where: { reports: { some: {} } } }),
    ]);

    const jobIds = jobs.map(j => j.id);
    let reportCounts: Record<string, number> = {};
    if (jobIds.length) {
      const groups = await prisma.jobReport.groupBy({
        by: ['jobId'],
        where: { jobId: { in: jobIds } },
        _count: { id: true },
      });
      reportCounts = Object.fromEntries(groups.map(g => [g.jobId, g._count.id]));
    }

    const enriched = jobs.map(j => ({ ...j, reportCount: reportCounts[j.id] ?? 0 }));
    const stats: Record<string, number> = Object.fromEntries(statusGroups.map(g => [g.status, g._count.id]));
    stats.reported = reportedCount;

    return NextResponse.json({ jobs: enriched, total, page, totalPages: Math.ceil(total / pageSize), pageSize, stats });
  } catch (error) {
    console.error('[GET /api/admin/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

