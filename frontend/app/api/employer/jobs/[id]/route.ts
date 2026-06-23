import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { JobStatus, JobType, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ── GET — fetch a single job owned by this employer ──────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true } } },
    });
    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[GET /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── PATCH — update status OR full job fields ───────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json() as {
      status?: string;
      title?: string; description?: string; location?: string;
      type?: string; experienceLevel?: string;
      salaryMin?: number | null; salaryMax?: number | null;
      vacancies?: number; skills?: string[];
      urgent?: boolean; deadline?: string;
    };

    const validStatuses = Object.values(JobStatus)        as string[];
    const validTypes    = Object.values(JobType)           as string[];
    const validLevels   = Object.values(ExperienceLevel)   as string[];

    if (body.status          !== undefined && !validStatuses.includes(body.status))           return NextResponse.json({ error: 'Invalid status' },           { status: 400 });
    if (body.type            !== undefined && !validTypes.includes(body.type))                return NextResponse.json({ error: 'Invalid job type' },          { status: 400 });
    if (body.experienceLevel !== undefined && !validLevels.includes(body.experienceLevel))   return NextResponse.json({ error: 'Invalid experience level' },   { status: 400 });
    if (body.title           !== undefined && body.title.trim().length > 150)        return NextResponse.json({ error: 'title must be 150 characters or fewer' }, { status: 400 });
    if (body.location        !== undefined && body.location.trim().length > 150)     return NextResponse.json({ error: 'location must be 150 characters or fewer' }, { status: 400 });
    if (body.description     !== undefined && body.description.trim().length > 10000) return NextResponse.json({ error: 'description must be 10,000 characters or fewer' }, { status: 400 });
    if (body.salaryMin != null && (!Number.isFinite(body.salaryMin) || body.salaryMin < 0 || body.salaryMin > 1_000_000_000)) {
      return NextResponse.json({ error: 'salaryMin must be between 0 and 1,000,000,000' }, { status: 400 });
    }
    if (body.salaryMax != null && (!Number.isFinite(body.salaryMax) || body.salaryMax < 0 || body.salaryMax > 1_000_000_000)) {
      return NextResponse.json({ error: 'salaryMax must be between 0 and 1,000,000,000' }, { status: 400 });
    }
    if (body.salaryMin != null && body.salaryMax != null && body.salaryMin > body.salaryMax) {
      return NextResponse.json({ error: 'salaryMin cannot exceed salaryMax' }, { status: 400 });
    }
    if (body.vacancies !== undefined && (!Number.isInteger(body.vacancies) || body.vacancies < 1 || body.vacancies > 1000)) {
      return NextResponse.json({ error: 'vacancies must be an integer between 1 and 1000' }, { status: 400 });
    }
    if (body.skills !== undefined && (!Array.isArray(body.skills) || body.skills.length > 30 || body.skills.some(s => typeof s !== 'string' || s.length > 50))) {
      return NextResponse.json({ error: 'skills must be an array of at most 30 strings, each 50 characters or fewer' }, { status: 400 });
    }

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...(body.status          !== undefined && { status:          body.status          as JobStatus }),
        ...(body.title           !== undefined && { title:           body.title.trim() }),
        ...(body.description     !== undefined && { description:     body.description.trim() }),
        ...(body.location        !== undefined && { location:        body.location.trim() }),
        ...(body.type            !== undefined && { type:            body.type            as JobType }),
        ...(body.experienceLevel !== undefined && { experienceLevel: body.experienceLevel as ExperienceLevel }),
        ...(body.salaryMin       !== undefined && { salaryMin:       body.salaryMin }),
        ...(body.salaryMax       !== undefined && { salaryMax:       body.salaryMax }),
        ...(body.vacancies       !== undefined && { vacancies:       body.vacancies }),
        ...(body.skills          !== undefined && { skills:          body.skills.filter(Boolean) }),
        ...(body.deadline        !== undefined && { expiresAt:       new Date(body.deadline) }),
      },
    });

    // Update is_urgent via raw SQL (Prisma client types lag until next generate)
    if (body.urgent !== undefined) {
      await prisma.$executeRaw`UPDATE jobs SET is_urgent = ${body.urgent} WHERE id = ${params.id}`;
    }

    console.log('[PATCH /api/employer/jobs/:id] updated job', params.id, 'for company', company.id);
    return NextResponse.json({ ...updated, isUrgent: body.urgent ?? false });
  } catch (error) {
    console.error('[PATCH /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE — permanently remove the job ───────────────────────────────────────
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.job.delete({ where: { id: params.id } });
    console.log('[DELETE /api/employer/jobs/:id] deleted job', params.id, 'for company', company.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/employer/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
