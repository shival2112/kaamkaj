import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/mailer';
import { meetingScheduledHtml } from '@/lib/emailTemplates/meetingScheduled';

export const dynamic = 'force-dynamic';

async function getAdminId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return dbUser?.role === 'ADMIN' ? user.id : null;
}

export async function GET() {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        participant: { select: { id: true, name: true, email: true, role: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('[GET /api/admin/meetings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as {
      userId?: string;
      jobId?: string;
      date?: string;
      time?: string;
      mode?: string;
      round?: string;
      link?: string;
      interviewer?: string;
    };

    const { userId, jobId, date, time, mode, round, link, interviewer } = body;
    if (!userId || !date || !time || !round || !interviewer) {
      return NextResponse.json({ error: 'userId, date, time, round, and interviewer are required' }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        userId,
        jobId:       jobId || null,
        date,
        time,
        mode:        mode ?? 'Online',
        round,
        link:        link || null,
        interviewer,
        scheduledBy: adminId,
      },
      include: {
        participant: { select: { id: true, name: true, email: true, role: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    // Send notification email (non-blocking)
    if (meeting.participant.email) {
      const isEmployer = meeting.participant.role === 'EMPLOYER';
      sendEmail({
        to:      meeting.participant.email,
        subject: `Meeting Scheduled — ${meeting.job?.title ?? 'General Meeting'}`,
        html:    meetingScheduledHtml(
          meeting.participant.name,
          meeting.job?.title ?? 'General Meeting',
          'KaamKaaj Admin',
          date,
          time,
          mode ?? 'Online',
          round,
          interviewer,
          link,
          isEmployer,
        ),
      }).then(() => {
        console.log(`[admin meeting] notification sent to ${meeting.participant.email}`);
      }).catch((err) => {
        console.error('[admin meeting] notification failed:', err);
      });
    }

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/meetings]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
