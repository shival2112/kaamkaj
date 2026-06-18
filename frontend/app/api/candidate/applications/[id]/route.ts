import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Require a withdrawal reason
    let reason = '';
    try {
      const body = await req.json() as { reason?: unknown };
      reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    } catch {
      // body may be absent — caught below
    }
    if (reason.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a withdrawal reason (at least 10 characters).' },
        { status: 400 },
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      select: { id: true, candidateId: true, status: true, job: { select: { title: true } } },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (application.candidateId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // Only allow withdrawal while still in early stages
    if (!['APPLIED', 'REVIEWING'].includes(application.status)) {
      return NextResponse.json(
        { error: 'Application cannot be withdrawn at this stage.' },
        { status: 409 },
      );
    }

    console.info(`[WITHDRAW] user=${user.id} app=${params.id} job="${application.job.title}" reason="${reason}"`);

    await prisma.application.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/candidate/applications/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
