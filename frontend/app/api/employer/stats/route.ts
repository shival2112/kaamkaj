import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) {
      console.log('[GET /api/employer/stats] no company for userId', userId);
      return NextResponse.json({ activeJobs: 0, totalApplicants: 0, newToday: 0 });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true, status: true },
    });
    const jobIds  = jobs.map(j => j.id);
    const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalApplicants, newToday] = await Promise.all([
      prisma.application.count({ where: { jobId: { in: jobIds } } }),
      prisma.application.count({ where: { jobId: { in: jobIds }, appliedAt: { gte: todayStart } } }),
    ]);

    console.log('[GET /api/employer/stats] company', company.id, '→ activeJobs:', activeJobs, 'totalApplicants:', totalApplicants, 'newToday:', newToday);
    return NextResponse.json({ activeJobs, totalApplicants, newToday });
  } catch (error) {
    console.error('[GET /api/employer/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
