import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { resolveCandidateUserId } from '@/lib/candidate-auth';

export const dynamic = 'force-dynamic';

const VALID_REASONS = [
  'Spam or misleading',
  'Inappropriate content',
  'Duplicate listing',
  'Fake company',
  'Other',
] as const;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveCandidateUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { reason?: string };
    const { reason } = body;

    if (!reason || !VALID_REASONS.includes(reason as typeof VALID_REASONS[number])) {
      return NextResponse.json(
        { error: `reason must be one of: ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Use raw SQL — Prisma client predates the new job_reports table
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO job_reports (id, job_id, reporter_id, reason, created_at)
        VALUES (gen_random_uuid(), ${params.id}, ${userId}, ${reason}, NOW())
        ON CONFLICT (job_id, reporter_id) DO UPDATE SET reason = ${reason}, created_at = NOW()
      `
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/report]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
