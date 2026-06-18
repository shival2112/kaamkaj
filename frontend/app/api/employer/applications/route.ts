import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) {
      console.log('[GET /api/employer/applications] no company for userId', userId);
      return NextResponse.json({ applications: [], total: 0 });
    }

    const { searchParams } = new URL(request.url);
    const jobId  = searchParams.get('jobId')  || undefined;
    const status = searchParams.get('status') || undefined;
    const page   = Math.max(1, Number(searchParams.get('page')  || 1));
    const limit  = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 20)));

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      select: { id: true },
    });
    const jobIds = jobs.map(j => j.id);

    const validStatuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'];
    const filteredJobId    = jobId  && jobIds.includes(jobId)           ? jobId  : undefined;
    const filteredStatus   = status && validStatuses.includes(status.toUpperCase())
      ? status.toUpperCase() as 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED'
      : undefined;

    const where = {
      jobId:  filteredJobId  ? filteredJobId              : { in: jobIds },
      ...(filteredStatus && { status: filteredStatus }),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job:       { select: { id: true, title: true, status: true } },
          candidate: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    // Detect candidates who have applied to more than one of this company's jobs
    const candidateIds = Array.from(new Set(applications.map(a => a.candidateId)));
    let multiApplySet = new Set<string>();
    let noShowSet     = new Set<string>();
    if (candidateIds.length > 0) {
      const [multiGroups, noShowMeetings] = await Promise.all([
        prisma.application.groupBy({
          by: ['candidateId'],
          where: { candidateId: { in: candidateIds }, jobId: { in: jobIds } },
          _count: { id: true },
          having: { id: { _count: { gt: 1 } } },
        }),
        prisma.meeting.findMany({
          where: { userId: { in: candidateIds }, feedbackOutcome: 'NO_SHOW' },
          select: { userId: true },
        }),
      ]);
      multiApplySet = new Set(multiGroups.map(g => g.candidateId));
      noShowSet     = new Set(noShowMeetings.map(m => m.userId));
    }

    const enriched = applications.map(a => ({
      ...a,
      hasMultipleApps:  multiApplySet.has(a.candidateId),
      hasNoShowHistory: noShowSet.has(a.candidateId),
    }));

    console.log('[GET /api/employer/applications] returning', total, 'applications for company', company.id);
    return NextResponse.json({ applications: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/employer/applications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
