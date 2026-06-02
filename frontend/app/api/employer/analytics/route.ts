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
      return NextResponse.json({
        summary: { total: 0, byStatus: {} },
        topJobs: [],
        timeline: buildEmptyTimeline(),
      });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true, title: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const jobIds = jobs.map(j => j.id);

    if (jobIds.length === 0) {
      return NextResponse.json({
        summary: { total: 0, byStatus: {} },
        topJobs: [],
        timeline: buildEmptyTimeline(),
      });
    }

    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      select: { status: true, appliedAt: true },
    });

    const byStatus: Record<string, number> = {};
    for (const app of applications) {
      byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    }

    const timeline = buildTimeline(applications.map(a => a.appliedAt));

    const topJobs = jobs
      .map(j => ({ id: j.id, title: j.title, count: j._count.applications }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    console.log('[GET /api/employer/analytics] company', company.id, '→', applications.length, 'total applications');
    return NextResponse.json({ summary: { total: applications.length, byStatus }, topJobs, timeline });
  } catch (error) {
    console.error('[GET /api/employer/analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildTimeline(dates: Date[]): { date: string; count: number }[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const result: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label    = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const count    = dates.filter(dt => dt >= dayStart && dt <= dayEnd).length;
    result.push({ date: label, count });
  }
  return result;
}

function buildEmptyTimeline() { return buildTimeline([]); }
