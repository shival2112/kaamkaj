import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobStatus, ExperienceLevel } from '@prisma/client';
import { isMaintenanceMode } from '@/lib/siteSettings';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

// Maps new workMode/workType params to JobType enum values
function resolveTypeFilter(
  workModes: string[],
  workTypes: string[],
  legacyType?: string,
): JobType[] | undefined {
  const types: Set<JobType> = new Set();

  // Legacy type param (backward compat)
  if (legacyType) {
    const upper = legacyType.toUpperCase() as JobType;
    if (Object.values(JobType).includes(upper)) types.add(upper);
  }

  // Work Mode → JobType mapping
  for (const mode of workModes) {
    if (mode === 'wfh')   types.add(JobType.REMOTE);
    if (mode === 'wfo')   { types.add(JobType.FULL_TIME); types.add(JobType.PART_TIME); types.add(JobType.CONTRACT); }
    // 'field' is handled as keyword below
  }

  // Work Type → JobType mapping
  for (const wt of workTypes) {
    if (wt === 'full_time')  types.add(JobType.FULL_TIME);
    if (wt === 'part_time')  types.add(JobType.PART_TIME);
    if (wt === 'internship') types.add(JobType.INTERNSHIP);
  }

  return types.size > 0 ? Array.from(types) : undefined;
}

export async function GET(request: Request) {
  if (await isMaintenanceMode()) {
    return NextResponse.json({ error: 'Platform under maintenance' }, { status: 503 });
  }
  // Non-blocking: auto-expire jobs whose expiresAt has passed
  prisma.job.updateMany({
    where: { status: JobStatus.ACTIVE, expiresAt: { lt: new Date() } },
    data:  { status: JobStatus.EXPIRED },
  }).catch(() => {});

  try {
    const { searchParams } = new URL(request.url);

    // Existing params
    const q          = searchParams.get('q')?.trim() || undefined;
    const location   = searchParams.get('location')?.trim() || undefined;
    const expLevel   = searchParams.get('experienceLevel')?.toUpperCase() as ExperienceLevel | undefined;
    const legacyType = searchParams.get('type') || undefined;
    const legacySalMin = searchParams.get('salaryMin') ? Number(searchParams.get('salaryMin')) : undefined;
    const legacySalMax = searchParams.get('salaryMax') ? Number(searchParams.get('salaryMax')) : undefined;
    const sort       = searchParams.get('sort') ?? 'newest';
    const page       = Math.max(1, Number(searchParams.get('page') || 1));

    // New filter params
    const workModes  = searchParams.get('workMode')?.split(',').filter(Boolean) ?? [];
    const workTypes  = searchParams.get('workType')?.split(',').filter(Boolean) ?? [];
    const shifts     = searchParams.get('shift')?.split(',').filter(Boolean) ?? [];
    const departments = searchParams.get('department')?.split(',').filter(Boolean) ?? [];
    const datePosted = searchParams.get('datePosted') || 'all';
    // salaryMin in new UI is monthly; multiply by 12 for annual DB comparison
    const newMonthlySalMin = searchParams.get('salaryMin')
      ? Number(searchParams.get('salaryMin'))
      : undefined;

    // Resolve type filter from all sources
    const typeFilter = resolveTypeFilter(workModes, workTypes, legacyType);

    // Resolve experience level
    const validLevels = Object.values(ExperienceLevel);
    const levelFilter = expLevel && validLevels.includes(expLevel) ? expLevel : undefined;

    // Date posted → createdAt
    let createdAtFilter: { gte: Date } | undefined;
    if (datePosted === '24h') createdAtFilter = { gte: new Date(Date.now() - 86400000) };
    else if (datePosted === '3d') createdAtFilter = { gte: new Date(Date.now() - 3 * 86400000) };
    else if (datePosted === '7d') createdAtFilter = { gte: new Date(Date.now() - 7 * 86400000) };

    // Salary filter — prefer monthly (new UI) over legacy annual params
    // New UI sends monthly values; annual = monthly * 12
    const annualSalMin = newMonthlySalMin && newMonthlySalMin > 0
      ? newMonthlySalMin * 12
      : legacySalMin;
    const annualSalMax = legacySalMax;

    // Build keyword OR conditions
    const keywordOr: Record<string, unknown>[] = [];
    if (q) {
      keywordOr.push(
        { title:       { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { skills:      { hasSome: [q] } },
      );
    }
    // Shift keyword filter
    if (shifts.includes('night')) keywordOr.push({ title: { contains: 'night shift', mode: 'insensitive' as const } });
    if (shifts.includes('day'))   keywordOr.push({ title: { contains: 'day shift', mode: 'insensitive' as const } });
    // Field work keyword filter
    if (workModes.includes('field')) keywordOr.push({ skills: { hasSome: ['Field Work', 'Field Job', 'Field Sales'] } });

    const where: Record<string, unknown> = {
      status: JobStatus.ACTIVE,
      ...(keywordOr.length > 0 && { OR: keywordOr }),
      ...(location   && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(typeFilter && { type: { in: typeFilter } }),
      ...(levelFilter && { experienceLevel: levelFilter }),
      ...(annualSalMin && { salaryMin: { gte: annualSalMin } }),
      ...(annualSalMax && { salaryMax: { lte: annualSalMax } }),
      ...(createdAtFilter && { createdAt: createdAtFilter }),
    };

    // Department filter → match against company.industry
    if (departments.length > 0) {
      where.company = {
        industry: { in: departments },
      };
    }

    const orderBy =
      sort === 'trending'    ? { viewCount: 'desc' as const } :
      sort === 'salary_desc' ? { salaryMax: 'desc' as const } :
      sort === 'salary_asc'  ? { salaryMin: 'asc'  as const } :
      sort === 'date_new'    ? { createdAt: 'desc' as const } :
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
