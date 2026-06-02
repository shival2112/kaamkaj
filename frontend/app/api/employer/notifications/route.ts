import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) return NextResponse.json({ notifications: [] });

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true },
    });
    const jobIds = jobs.map(j => j.id);

    if (jobIds.length === 0) return NextResponse.json({ notifications: [] });

    // Return the 20 most recent applications as notifications
    const applications = await prisma.application.findMany({
      where:   { jobId: { in: jobIds } },
      select: {
        id:        true,
        appliedAt: true,
        status:    true,
        candidate: { select: { name: true } },
        job:       { select: { title: true } },
      },
      orderBy: { appliedAt: 'desc' },
      take:    20,
    });

    const notifications = applications.map(a => ({
      id:            a.id,
      candidateName: a.candidate.name,
      jobTitle:      a.job.title,
      appliedAt:     a.appliedAt,
      status:        a.status,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[GET /api/employer/notifications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
