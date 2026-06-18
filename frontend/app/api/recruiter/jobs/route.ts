import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const skip  = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, title: true, location: true, type: true,
          status: true, experienceLevel: true, createdAt: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where: { companyId: ctx.companyId } }),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/recruiter/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      title?: string; description?: string; location?: string;
      type?: string; salaryMin?: number; salaryMax?: number;
      skills?: string[]; experienceLevel?: string; vacancies?: number;
      expiresAt?: string;
    };

    const { title, description, location, type, salaryMin, salaryMax,
            skills, experienceLevel, vacancies, expiresAt } = body;

    if (!title?.trim() || !description?.trim() || !location?.trim()) {
      return NextResponse.json({ error: 'title, description, and location are required' }, { status: 400 });
    }

    const validTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT', 'INTERNSHIP'];
    const validLevels = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
    const jobType = validTypes.includes((type ?? '').toUpperCase())
      ? (type!.toUpperCase() as 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'CONTRACT' | 'INTERNSHIP')
      : 'FULL_TIME';
    const expLevel = validLevels.includes((experienceLevel ?? '').toUpperCase())
      ? (experienceLevel!.toUpperCase() as 'FRESHER' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD')
      : 'FRESHER';

    const job = await prisma.job.create({
      data: {
        title:           title.trim(),
        description:     description.trim(),
        location:        location.trim(),
        companyId:       ctx.companyId,
        type:            jobType,
        experienceLevel: expLevel,
        salaryMin:       salaryMin ?? null,
        salaryMax:       salaryMax ?? null,
        skills:          skills ?? [],
        vacancies:       vacancies ?? 1,
        expiresAt:       expiresAt ? new Date(expiresAt) : null,
        status:          'ACTIVE',
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('[POST /api/recruiter/jobs]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
