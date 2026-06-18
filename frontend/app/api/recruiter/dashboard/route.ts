import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [
      assignedApps,
      todayInterviews,
      passCount,
      failCount,
      hiredCount,
      recentApps,
    ] = await Promise.all([
      prisma.application.count({
        where: { assignedRecruiterId: ctx.userId },
      }),
      prisma.meeting.count({
        where: { scheduledBy: ctx.userId, date: todayStr, status: 'scheduled' },
      }),
      prisma.interviewEvaluation.count({
        where: { evaluatorId: ctx.userId, recommendation: 'PASS' },
      }),
      prisma.interviewEvaluation.count({
        where: { evaluatorId: ctx.userId, recommendation: 'FAIL' },
      }),
      prisma.application.count({
        where: { assignedRecruiterId: ctx.userId, status: 'HIRED' },
      }),
      prisma.application.findMany({
        where: { assignedRecruiterId: ctx.userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true, status: true, appliedAt: true,
          job: { select: { title: true } },
          candidate: { select: { name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      assignedApps,
      todayInterviews,
      passCount,
      failCount,
      hiredCount,
      recentApps,
    });
  } catch (error) {
    console.error('[GET /api/recruiter/dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
