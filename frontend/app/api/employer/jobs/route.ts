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

    // ── Email verification gate ──────────────────────────────────────────────
    const employerUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, email: true },
    });
    if (employerUser && !employerUser.emailVerified && !employerUser.email.endsWith('@phone.kaamkaaj.internal')) {
      return NextResponse.json(
        { error: 'Please verify your email address before posting a job.', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    const body = await request.json() as {
      title: string; type: string; location: string;
      experienceLevel: string; salaryMin?: number; salaryMax?: number;
      vacancies?: number; skills?: string[]; description: string;
      urgent?: boolean; deadline?: string;
    };

    const { title, type, location, experienceLevel, salaryMin, salaryMax, vacancies = 1, skills = [], description, urgent = false, deadline } = body;

    if (!title?.trim() || !location?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title, location and description are required' }, { status: 400 });
    }
    if (title.trim().length > 150)        return NextResponse.json({ error: 'title must be 150 characters or fewer' }, { status: 400 });
    if (location.trim().length > 150)     return NextResponse.json({ error: 'location must be 150 characters or fewer' }, { status: 400 });
    if (description.trim().length > 10000) return NextResponse.json({ error: 'description must be 10,000 characters or fewer' }, { status: 400 });

    const validTypes  = Object.values(JobType)         as string[];
    const validLevels = Object.values(ExperienceLevel) as string[];
    if (!validTypes.includes(type))           return NextResponse.json({ error: 'Invalid job type' },        { status: 400 });
    if (!validLevels.includes(experienceLevel)) return NextResponse.json({ error: 'Invalid experience level' }, { status: 400 });

    if (salaryMin !== undefined && (!Number.isFinite(salaryMin) || salaryMin < 0 || salaryMin > 1_000_000_000)) {
      return NextResponse.json({ error: 'salaryMin must be between 0 and 1,000,000,000' }, { status: 400 });
    }
    if (salaryMax !== undefined && (!Number.isFinite(salaryMax) || salaryMax < 0 || salaryMax > 1_000_000_000)) {
      return NextResponse.json({ error: 'salaryMax must be between 0 and 1,000,000,000' }, { status: 400 });
    }
    if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
      return NextResponse.json({ error: 'salaryMin cannot exceed salaryMax' }, { status: 400 });
    }
    if (!Number.isInteger(vacancies) || vacancies < 1 || vacancies > 1000) {
      return NextResponse.json({ error: 'vacancies must be an integer between 1 and 1000' }, { status: 400 });
    }
    if (!Array.isArray(skills) || skills.length > 30 || skills.some(s => typeof s !== 'string' || s.length > 50)) {
      return NextResponse.json({ error: 'skills must be an array of at most 30 strings, each 50 characters or fewer' }, { status: 400 });
    }

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

    const expiresAt = deadline
      ? new Date(deadline)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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

    // Set is_urgent via raw SQL — Prisma client types lag behind schema until next generate
    if (urgent) {
      await prisma.$executeRaw`UPDATE jobs SET is_urgent = true WHERE id = ${job.id}`;
    }

    console.log('[POST /api/employer/jobs] created job', job.id, 'for company', company.id);
    return NextResponse.json({ ...job, isUrgent: urgent }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
