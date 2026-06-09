import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/mailer';
import { meetingScheduledHtml } from '@/lib/emailTemplates/meetingScheduled';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return dbUser?.role === 'ADMIN' ? user : null;
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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

    if (!userId || !date || !time) {
      return NextResponse.json({ error: 'userId, date, and time are required' }, { status: 400 });
    }

    const [participant, job] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { name: true, email: true, role: true },
      }),
      jobId
        ? prisma.job.findUnique({
            where:  { id: jobId },
            select: { title: true, company: { select: { name: true } } },
          })
        : null,
    ]);

    if (!participant?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobTitle   = job?.title ?? 'General Meeting';
    const orgName    = job?.company?.name ?? 'KaamKaaj Admin';
    const isEmployer = participant.role === 'EMPLOYER';

    sendEmail({
      to:      participant.email,
      subject: `Meeting Scheduled — ${jobTitle}`,
      html:    meetingScheduledHtml(
        participant.name,
        jobTitle,
        orgName,
        date,
        time,
        mode ?? 'Online',
        round,
        interviewer,
        link,
        isEmployer,
      ),
    }).then(() => {
      console.log(`[admin meeting notify] email sent to ${participant.email}`);
    }).catch((err) => {
      console.error('[admin meeting notify] email failed:', err);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/admin/meetings/notify]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
