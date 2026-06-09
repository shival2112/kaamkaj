import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const VALID_OUTCOMES = ['PASSED', 'FAILED', 'NO_SHOW'] as const;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      outcome?: string;
      rating?: number;
      notes?: string;
    };

    const { outcome, rating, notes } = body;

    if (!outcome || !VALID_OUTCOMES.includes(outcome as typeof VALID_OUTCOMES[number])) {
      return NextResponse.json(
        { error: 'outcome must be PASSED, FAILED, or NO_SHOW' },
        { status: 400 }
      );
    }
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json({ error: 'rating must be an integer 1–5' }, { status: 400 });
    }

    // Verify meeting belongs to this employer's company
    const company = await prisma.company.findUnique({ where: { ownerId: userId } });
    if (!company) return NextResponse.json({ error: 'No company found' }, { status: 404 });

    const meeting = await prisma.meeting.findUnique({ where: { id: params.id } });
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // Verify the scheduler belongs to this employer
    if (meeting.scheduledBy !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use raw SQL because Prisma client predates the new columns (pending regenerate)
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE meetings
        SET feedback_outcome = ${outcome},
            feedback_rating  = ${rating ?? null},
            feedback_notes   = ${notes ?? null},
            updated_at       = NOW()
        WHERE id = ${params.id}
      `
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[POST /api/employer/interviews/[id]/feedback]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const meeting = await prisma.meeting.findUnique({ where: { id: params.id } });
    if (!meeting || meeting.scheduledBy !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Read new columns via raw query
    const rows = await prisma.$queryRaw<
      { feedback_outcome: string | null; feedback_rating: number | null; feedback_notes: string | null }[]
    >(Prisma.sql`
      SELECT feedback_outcome, feedback_rating, feedback_notes
      FROM meetings WHERE id = ${params.id}
    `);

    const fb = rows[0];
    return NextResponse.json({
      feedback: {
        outcome: fb?.feedback_outcome ?? null,
        rating:  fb?.feedback_rating  ?? null,
        notes:   fb?.feedback_notes   ?? null,
      },
    });
  } catch (error) {
    console.error('[GET /api/employer/interviews/[id]/feedback]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
