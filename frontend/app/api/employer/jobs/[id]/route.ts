import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { JobStatus, JobType, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
    };

    const validStatuses = Object.values(JobStatus)        as string[];
    const validTypes    = Object.values(JobType)           as string[];
    const validLevels   = Object.values(ExperienceLevel)   as string[];

    if (body.status          !== undefined && !validStatuses.includes(body.status))           return NextResponse.json({ error: 'Invalid status' },           { status: 400 });
    if (body.type            !== undefined && !validTypes.includes(body.type))                return NextResponse.json({ error: 'Invalid job type' },          { status: 400 });
    if (body.experienceLevel !== undefined && !validLevels.includes(body.experienceLevel))   return NextResponse.json({ error: 'Invalid experience level' },   { status: 400 });

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
      },
    });

    console.log('[PATCH /api/employer/jobs/:id] updated job', params.id, 'for company', company.id);
    return NextResponse.json(updated);
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
