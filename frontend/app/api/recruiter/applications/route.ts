import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status  = searchParams.get('status');
    const jobId   = searchParams.get('jobId');
    const mine    = searchParams.get('mine') === 'true';
    const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit   = 20;
    const skip    = (page - 1) * limit;

    const validStatuses = ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'];

    const where = {
      job: { companyId: ctx.companyId },
      ...(status && validStatuses.includes(status) ? { status: status as 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' } : {}),
      ...(jobId ? { jobId } : {}),
      ...(mine ? { assignedRecruiterId: ctx.userId } : {}),
    };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, status: true, appliedAt: true, updatedAt: true,
          assignedRecruiterId: true, coverLetter: true, resumeUrl: true,
          job: { select: { id: true, title: true } },
          candidate: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ applications, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[GET /api/recruiter/applications]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
