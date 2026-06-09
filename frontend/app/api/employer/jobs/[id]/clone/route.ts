import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const original = await prisma.job.findUnique({ where: { id: params.id } });
    if (!original || original.companyId !== company.id) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const clone = await prisma.job.create({
      data: {
        title:           `Copy of ${original.title}`,
        description:     original.description,
        location:        original.location,
        type:            original.type,
        experienceLevel: original.experienceLevel,
        salaryMin:       original.salaryMin,
        salaryMax:       original.salaryMax,
        vacancies:       original.vacancies,
        skills:          original.skills,
        status:          'DRAFT',
        companyId:       company.id,
      },
    });

    return NextResponse.json({ job: clone }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/jobs/[id]/clone]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
