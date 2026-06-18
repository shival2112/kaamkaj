import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';
import { JobStatus, JobType, ExperienceLevel } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { _count: { select: { applications: true } } },
    });
    if (!job || job.companyId !== ctx.companyId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[GET /api/recruiter/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== ctx.companyId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json() as {
      title?: string; description?: string; location?: string;
      type?: string; experienceLevel?: string; status?: string;
      salaryMin?: number | null; salaryMax?: number | null;
      vacancies?: number; skills?: string[];
    };

    const validStatuses = Object.values(JobStatus) as string[];
    const validTypes    = Object.values(JobType)    as string[];
    const validLevels   = Object.values(ExperienceLevel) as string[];

    if (body.status          && !validStatuses.includes(body.status))          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    if (body.type            && !validTypes.includes(body.type))               return NextResponse.json({ error: 'Invalid type' },   { status: 400 });
    if (body.experienceLevel && !validLevels.includes(body.experienceLevel))   return NextResponse.json({ error: 'Invalid level' },   { status: 400 });

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: {
        ...(body.title           && { title:           body.title.trim() }),
        ...(body.description     && { description:     body.description.trim() }),
        ...(body.location        && { location:        body.location.trim() }),
        ...(body.type            && { type:            body.type            as JobType }),
        ...(body.experienceLevel && { experienceLevel: body.experienceLevel as ExperienceLevel }),
        ...(body.status          && { status:          body.status          as JobStatus }),
        ...(body.salaryMin  !== undefined && { salaryMin:  body.salaryMin }),
        ...(body.salaryMax  !== undefined && { salaryMax:  body.salaryMax }),
        ...(body.vacancies  !== undefined && { vacancies:  body.vacancies }),
        ...(body.skills     !== undefined && { skills:     body.skills.filter(Boolean) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/recruiter/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job || job.companyId !== ctx.companyId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.job.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/recruiter/jobs/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
