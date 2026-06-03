import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { sendEmail } from '@/lib/mailer';
import { interviewScheduledHtml } from '@/lib/emailTemplates/interviewScheduled';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const body = await request.json() as {
      candidateId?: string;
      jobId?: string;
      date?: string;
      time?: string;
      mode?: string;
      link?: string;
      round?: string;
    };

    const { candidateId, jobId, date, time, mode, link, round } = body;
    if (!candidateId || !date || !time) {
      return NextResponse.json({ error: 'candidateId, date, and time are required.' }, { status: 400 });
    }

    // Fetch candidate + job for the email
    const [candidate, job] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: candidateId },
        select: { name: true, email: true },
      }),
      jobId
        ? prisma.job.findUnique({ where: { id: jobId }, select: { title: true } })
        : null,
    ]);

    const jobTitle = job?.title ?? 'the position';

    // Send email notification (non-blocking, uses Ethereal free SMTP in dev)
    if (candidate?.email) {
      sendEmail({
        to:      candidate.email,
        subject: `Interview scheduled — ${jobTitle} at ${company.name}`,
        html:    interviewScheduledHtml(
          candidate.name,
          jobTitle,
          company.name,
          date,
          time,
          mode ?? 'In-person',
          link,
        ),
      }).then((info) => {
        console.log(`[interview email] sent to ${candidate.email} — round: ${round ?? '1'}`);
        // In dev mode Ethereal logs a preview URL automatically in sendEmail()
        void info;
      }).catch(err => {
        console.error('[interview email] failed:', err);
      });
    } else {
      console.log(`[interview stub] no email for candidate ${candidateId} — would send interview details`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/employer/interviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
