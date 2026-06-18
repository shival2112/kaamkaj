import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveRecruiterContext } from '@/lib/recruiter-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') ?? 'upcoming'; // upcoming | past | all

    const today = new Date().toISOString().slice(0, 10);

    const where = {
      scheduledBy: ctx.userId,
      ...(filter === 'upcoming' ? { date: { gte: today }, status: 'scheduled' } : {}),
      ...(filter === 'past'     ? { date: { lt: today } } : {}),
    };

    const interviews = await prisma.meeting.findMany({
      where,
      orderBy: [{ date: filter === 'past' ? 'desc' : 'asc' }, { time: 'asc' }],
      take: 50,
      select: {
        id: true, round: true, date: true, time: true, mode: true,
        link: true, interviewer: true, status: true, createdAt: true,
        feedbackOutcome: true, feedbackRating: true,
        participant: { select: { id: true, name: true, email: true, avatar: true } },
        job: { select: { id: true, title: true } },
        evaluation: { select: { id: true, recommendation: true } },
      },
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('[GET /api/recruiter/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await resolveRecruiterContext();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      candidateId?: string; jobId?: string; round?: string;
      date?: string; time?: string; mode?: string;
      link?: string; interviewer?: string;
    };

    const { candidateId, jobId, round, date, time, mode, link, interviewer } = body;

    if (!candidateId || !round?.trim() || !date || !time || !mode?.trim() || !interviewer?.trim()) {
      return NextResponse.json(
        { error: 'candidateId, round, date, time, mode, and interviewer are required' },
        { status: 400 }
      );
    }

    // Verify candidate belongs to a job in this company
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId }, select: { companyId: true } });
      if (!job || job.companyId !== ctx.companyId) {
        return NextResponse.json({ error: 'Job not found in your company' }, { status: 400 });
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        userId:      candidateId,
        jobId:       jobId ?? null,
        round:       round.trim(),
        date,
        time,
        mode:        mode.trim(),
        link:        link?.trim() ?? null,
        interviewer: interviewer.trim(),
        scheduledBy: ctx.userId,
        status:      'scheduled',
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('[POST /api/recruiter/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
