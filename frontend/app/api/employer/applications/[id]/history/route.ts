import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      select: { job: { select: { companyId: true } } },
    });
    if (!application || application.job.companyId !== company.id) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const logs = await prisma.applicationStatusLog.findMany({
      where: { applicationId: params.id },
      orderBy: { changedAt: 'asc' },
    });

    return NextResponse.json({ history: logs });
  } catch (error) {
    console.error('[GET /api/employer/applications/[id]/history]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
