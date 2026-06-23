import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { sendEmail } from '@/lib/mailer';
import { interviewScheduledHtml } from '@/lib/emailTemplates/interviewScheduled';

export const dynamic = 'force-dynamic';

// GET — list all interviews scheduled for this employer's company jobs
export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ interviews: [] });

    const interviews = await prisma.meeting.findMany({
      where: { job: { companyId: company.id } },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      select: {
        id: true, round: true, date: true, time: true, mode: true,
        link: true, interviewer: true, status: true,
        feedbackOutcome: true, feedbackRating: true, feedbackNotes: true,
        participant: { select: { id: true, name: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('[GET /api/employer/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — schedule an interview for a candidate's application to one of this employer's jobs
export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const body = await request.json() as {
      applicationId?: string;
      date?: string;
      time?: string;
      mode?: string;
      link?: string;
      round?: string;
      interviewer?: string;
    };

    const { applicationId, date, time, mode, link, round, interviewer } = body;
    if (!applicationId || !date || !time) {
      return NextResponse.json({ error: 'applicationId, date, and time are required.' }, { status: 400 });
    }

    // Verify the application belongs to a job owned by this employer's company
    const application = await prisma.application.findUnique({
      where:  { id: applicationId },
      select: {
        candidateId: true,
        job:       { select: { id: true, companyId: true, title: true } },
        candidate: { select: { name: true, email: true } },
      },
    });
    if (!application || application.job.companyId !== company.id) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        userId:      application.candidateId,
        jobId:       application.job.id,
        round:       round?.trim() || 'Round 1',
        date,
        time,
        mode:        mode?.trim() || 'Online',
        link:        link?.trim() || null,
        interviewer: interviewer?.trim() || company.name,
        scheduledBy: userId,
        status:      'scheduled',
      },
      select: {
        id: true, round: true, date: true, time: true, mode: true,
        link: true, interviewer: true, status: true,
        feedbackOutcome: true, feedbackRating: true, feedbackNotes: true,
        participant: { select: { id: true, name: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    // Send email notification (non-blocking, uses Ethereal free SMTP in dev)
    if (application.candidate.email) {
      sendEmail({
        to:      application.candidate.email,
        subject: `Interview scheduled — ${application.job.title} at ${company.name}`,
        html:    interviewScheduledHtml(
          application.candidate.name,
          application.job.title,
          company.name,
          date,
          time,
          mode ?? 'Online',
          link,
        ),
      }).then((info) => {
        console.log(`[interview email] sent to ${application.candidate.email}`);
        void info;
      }).catch((err) => {
        console.error('[interview email] failed:', err);
      });
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
