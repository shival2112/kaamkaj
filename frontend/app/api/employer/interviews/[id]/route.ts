import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

async function verifyOwnership(meetingId: string, userId: string) {
  const company = await prisma.company.findUnique({ where: { ownerId: userId } });
  if (!company) return null;

  const meeting = await prisma.meeting.findUnique({
    where:  { id: meetingId },
    select: { id: true, job: { select: { companyId: true } } },
  });
  if (!meeting || meeting.job?.companyId !== company.id) return null;
  return meeting;
}

// GET — single interview (used by the feedback page)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owned = await verifyOwnership(params.id, userId);
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const meeting = await prisma.meeting.findUnique({
      where:  { id: params.id },
      select: {
        id: true, round: true, date: true, time: true, mode: true,
        link: true, interviewer: true, status: true,
        feedbackOutcome: true, feedbackRating: true, feedbackNotes: true,
        participant: { select: { id: true, name: true } },
        job:         { select: { id: true, title: true, skills: true } },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('[GET /api/employer/interviews/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — edit interview details or change status (e.g. cancel / complete)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owned = await verifyOwnership(params.id, userId);
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json() as {
      date?: string; time?: string; mode?: string; round?: string;
      link?: string; interviewer?: string; status?: string;
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
      select: {
        id: true, round: true, date: true, time: true, mode: true,
        link: true, interviewer: true, status: true,
        feedbackOutcome: true, feedbackRating: true, feedbackNotes: true,
        participant: { select: { id: true, name: true } },
        job:         { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('[PATCH /api/employer/interviews/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — permanently remove an interview
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const owned = await verifyOwnership(params.id, userId);
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.meeting.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/employer/interviews/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
