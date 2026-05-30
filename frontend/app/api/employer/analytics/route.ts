import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (!company) {
      return NextResponse.json({
        summary: { total: 0, byStatus: {} },
        topJobs: [],
        timeline: buildEmptyTimeline(),
      });
    }

    // All job IDs for this employer
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

    // All applications for this employer
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      select: { status: true, appliedAt: true },
    });

    // Status breakdown
    const byStatus: Record<string, number> = {};
    for (const app of applications) {
      byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
    }

    // Applications per day — last 14 days
    const timeline = buildTimeline(applications.map(a => a.appliedAt));

    // Top 5 jobs by application count
    const topJobs = jobs
      .map(j => ({ id: j.id, title: j.title, count: j._count.applications }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      summary: { total: applications.length, byStatus },
      topJobs,
      timeline,
    });
  } catch (error) {
    console.error('[GET /api/employer/analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Builds a 14-day timeline array [{date, count}] ending today
function buildTimeline(dates: Date[]): { date: string; count: number }[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const result: { date: string; count: number }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999);
    const count = dates.filter(dt => dt >= dayStart && dt <= dayEnd).length;
    result.push({ date: label, count });
  }
  return result;
}

function buildEmptyTimeline(): { date: string; count: number }[] {
  return buildTimeline([]);
}
