import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { JobType, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) {
      console.log('[GET /api/employer/jobs] no company for userId', userId);
      return NextResponse.json({ jobs: [], total: 0 });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Count applications received in the last 7 days per job
    const weekAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const jobIds   = jobs.map(j => j.id);
    const weekly   = await prisma.application.groupBy({
      by:    ['jobId'],
      where: { jobId: { in: jobIds }, appliedAt: { gte: weekAgo } },
      _count: { id: true },
    });
    const weeklyMap = new Map(weekly.map(w => [w.jobId, w._count.id]));

    const jobsWithStats = jobs.map(j => ({
      ...j,
      totalApplicants:    j._count.applications,
      applicantsThisWeek: weeklyMap.get(j.id) ?? 0,
    }));

    console.log('[GET /api/employer/jobs] returning', jobs.length, 'jobs for company', company.id);
    return NextResponse.json({ jobs: jobsWithStats, total: jobs.length, company });
  } catch (error) {
    console.error('[GET /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      title: string; type: string; location: string;
      experienceLevel: string; salaryMin?: number; salaryMax?: number;
      vacancies?: number; skills?: string[]; description: string;
    };

    const { title, type, location, experienceLevel, salaryMin, salaryMax, vacancies = 1, skills = [], description } = body;

    if (!title?.trim() || !location?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title, location and description are required' }, { status: 400 });
    }

    const validTypes  = Object.values(JobType)         as string[];
    const validLevels = Object.values(ExperienceLevel) as string[];
    if (!validTypes.includes(type))           return NextResponse.json({ error: 'Invalid job type' },        { status: 400 });
    if (!validLevels.includes(experienceLevel)) return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });

    // Find or auto-create company for this employer
    let company = await prisma.company.findUnique({ where: { ownerId: userId } });

    // Enforce active job posting limit
    if (company) {
      const activeCount = await prisma.job.count({
        where: { companyId: company.id, status: 'ACTIVE' },
      });
      if (activeCount >= 50) {
        return NextResponse.json(
          { error: 'Active job limit reached (50). Please close some existing jobs before posting new ones.' },
          { status: 429 }
        );
      }
    }
    if (!company) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      const displayName = user?.name ?? 'Employer';
      company = await prisma.company.create({
        data: { name: `${displayName}'s Company`, ownerId: userId },
      });
      console.log('[POST /api/employer/jobs] auto-created company', company.id, 'for userId', userId);
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        companyId: company.id,
        location: location.trim(),
        salaryMin:       salaryMin ?? null,
        salaryMax:       salaryMax ?? null,
        type:            type            as JobType,
        experienceLevel: experienceLevel as ExperienceLevel,
        status:          'ACTIVE',
        vacancies,
        skills:          skills.filter(Boolean),
        expiresAt,
      },
    });

    console.log('[POST /api/employer/jobs] created job', job.id, 'for company', company.id);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
