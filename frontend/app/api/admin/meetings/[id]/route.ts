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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as {
      date?: string;
      time?: string;
      mode?: string;
      round?: string;
      link?: string;
      interviewer?: string;
      status?: string;
    };

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        ...(body.date        !== undefined && { date: body.date }),
        ...(body.time        !== undefined && { time: body.time }),
        ...(body.mode        !== undefined && { mode: body.mode }),
        ...(body.round       !== undefined && { round: body.round }),
        ...(body.link        !== undefined && { link: body.link || null }),
        ...(body.interviewer !== undefined && { interviewer: body.interviewer }),
        ...(body.status      !== undefined && { status: body.status }),
      },
      include: {
        participant: { select: { id: true, name: true, email: true, role: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('[PATCH /api/admin/meetings/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.meeting.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/meetings/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST to this route re-sends notification for an existing meeting
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const adminId = await getAdminId();
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        participant: { select: { name: true, email: true, role: true } },
        job:         { select: { title: true } },
      },
    });

    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    if (!meeting.participant.email) {
      return NextResponse.json({ error: 'Participant has no email' }, { status: 400 });
    }

    const isEmployer = meeting.participant.role === 'EMPLOYER';

    await sendEmail({
      to:      meeting.participant.email,
      subject: `Meeting Reminder — ${meeting.job?.title ?? 'General Meeting'}`,
      html:    meetingScheduledHtml(
        meeting.participant.name,
        meeting.job?.title ?? 'General Meeting',
        'KaamKaaj Admin',
        meeting.date,
        meeting.time,
        meeting.mode,
        meeting.round,
        meeting.interviewer,
        meeting.link ?? undefined,
        isEmployer,
      ),
    });

    console.log(`[admin meeting notify] reminder sent to ${meeting.participant.email}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/admin/meetings/[id]] notify', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
